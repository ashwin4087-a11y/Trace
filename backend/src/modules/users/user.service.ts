import type { AccountStatus, Prisma, RoleName } from "@prisma/client";
import { prisma } from "../../config/database";
import { ApiError } from "../../shared/errors/api-error";
import { hashPassword } from "../../shared/utils/tokens";
import { recordAudit } from "../audit/audit.service";
import { toPublicUser } from "../auth/auth.service";

const userAccessInclude = {
  userRoles: {
    include: {
      role: { include: { permissions: { include: { permission: true } } } },
    },
  },
  organization: { select: { id: true, name: true, code: true, status: true } },
  department: { select: { id: true, name: true, code: true, status: true } },
} satisfies Prisma.UserInclude;

type AdminUser = Prisma.UserGetPayload<{ include: typeof userAccessInclude }>;

function toAdminUser(user: AdminUser) {
  const safe = toPublicUser(user, user.userRoles);
  return {
    ...safe,
    roles: safe.roles,
    organization: user.organization,
    department: user.department,
  };
}

async function assertAdminCanModify(actorId: string, targetId: string, nextRole?: RoleName, nextStatus?: AccountStatus) {
  const actor = await prisma.user.findUnique({ where: { id: actorId }, select: { role: true, status: true } });
  if (!actor) throw new ApiError(401, "UNAUTHENTICATED", "Authentication required");
  const target = await prisma.user.findUnique({ where: { id: targetId }, select: { role: true, status: true } });
  if (!target) throw new ApiError(404, "NOT_FOUND", "User not found");

  const removesActiveAdmin =
    target.role === "ADMIN" &&
    target.status === "ACTIVE" &&
    ((nextRole !== undefined && nextRole !== "ADMIN") ||
      (nextStatus !== undefined && nextStatus !== "ACTIVE"));
  if (!removesActiveAdmin) return;

  const activeAdmins = await prisma.user.count({ where: { role: "ADMIN", status: "ACTIVE" } });
  if (activeAdmins <= 1) {
    throw new ApiError(409, "FINAL_ADMIN_PROTECTED", "The final active administrator cannot be removed");
  }
}

export async function listUsers(input: {
  page: number;
  pageSize: number;
  search?: string;
  role?: RoleName;
  status?: AccountStatus;
  organizationId?: string;
  departmentId?: string;
}) {
  const where: Prisma.UserWhereInput = {};
  if (input.role) where.userRoles = { some: { role: { name: input.role } } };
  if (input.status) where.status = input.status;
  if (input.organizationId) where.organizationId = input.organizationId;
  if (input.departmentId) where.departmentId = input.departmentId;
  if (input.search) {
    where.OR = [
      { email: { contains: input.search, mode: "insensitive" } },
      { firstName: { contains: input.search, mode: "insensitive" } },
      { lastName: { contains: input.search, mode: "insensitive" } },
      { name: { contains: input.search, mode: "insensitive" } },
    ];
  }
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
      include: userAccessInclude,
    }),
    prisma.user.count({ where }),
  ]);
  return { items: items.map(toAdminUser), total };
}

export async function getUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      ...userAccessInclude,
      organizationMemberships: {
        include: {
          organization: { select: { id: true, name: true, code: true, status: true } },
          department: { select: { id: true, name: true, code: true, status: true } },
        },
      },
    },
  });
  if (!user) throw new ApiError(404, "NOT_FOUND", "User not found");
  return {
    ...toAdminUser(user),
    memberships: user.organizationMemberships,
  };
}

export async function updateUser(
  actorId: string,
  id: string,
  input: {
    firstName?: string;
    lastName?: string;
    name?: string | null;
    phone?: string | null;
    organizationId?: string | null;
    departmentId?: string | null;
    preferredLanguage?: "EN" | "TA" | "EN_TA";
  },
) {
  const existing = await prisma.user.findUnique({ where: { id }, select: { role: true, status: true } });
  if (!existing) throw new ApiError(404, "NOT_FOUND", "User not found");
  const user = await prisma.user.update({ where: { id }, data: input });
  await recordAudit(actorId, "UPDATE_USER", "User", id);
  return getUser(id);
}

export async function assignRole(actorId: string, id: string, role: RoleName) {
  const existing = await prisma.user.findUnique({ where: { id }, select: { role: true, status: true } });
  if (!existing) throw new ApiError(404, "NOT_FOUND", "User not found");
  if (existing.role === role) return getUser(id);
  await assertAdminCanModify(actorId, id, role);
  const assignedRole = await prisma.role.findUnique({ where: { name: role } });
  if (!assignedRole) throw new ApiError(404, "NOT_FOUND", "Role not found");
  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { role } }),
    prisma.userRole.deleteMany({ where: { userId: id } }),
    prisma.userRole.create({ data: { userId: id, roleId: assignedRole.id } }),
  ]);
  await recordAudit(actorId, "CHANGE_ROLE", "User", id, { from: existing.role, to: role });
  return getUser(id);
}

export async function createOrganizer(
  actorId: string,
  input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationId?: string;
    departmentId?: string;
  },
) {
  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash: await hashPassword(input.password),
      firstName: input.firstName,
      lastName: input.lastName,
      role: "ORGANIZER",
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      organizationId: input.organizationId,
      departmentId: input.departmentId,
      notificationPreference: { create: {} },
    },
  });
  const organizerRole = await prisma.role.findUnique({ where: { name: "ORGANIZER" } });
  if (organizerRole) {
    await prisma.userRole.create({ data: { userId: user.id, roleId: organizerRole.id } });
  }
  await recordAudit(actorId, "CREATE_ORGANIZER", "User", user.id);
  return toPublicUser(user);
}

export async function setStatus(actorId: string, id: string, status: AccountStatus) {
  const existing = await prisma.user.findUnique({ where: { id }, select: { status: true } });
  if (!existing) throw new ApiError(404, "NOT_FOUND", "User not found");
  await assertAdminCanModify(actorId, id, undefined, status);
  await prisma.user.update({ where: { id }, data: { status } });
  await recordAudit(actorId, status === "SUSPENDED" ? "SUSPEND_USER" : "UPDATE_USER", "User", id, { status });
  return getUser(id);
}
