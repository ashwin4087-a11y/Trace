import type { AccountStatus, Prisma, RoleName } from "@prisma/client";
import { prisma } from "../../config/database";
import { ApiError } from "../../shared/errors/api-error";
import { hashPassword } from "../../shared/utils/tokens";
import { recordAudit } from "../audit/audit.service";
import { toPublicUser } from "../auth/auth.service";

const organizerInclude = {
  organization: { select: { id: true, name: true, code: true, status: true } },
  department: { select: { id: true, name: true, code: true, status: true } },
  userRoles: { include: { role: true } },
} satisfies Prisma.UserInclude;

type OrganizerUser = Prisma.UserGetPayload<{ include: typeof organizerInclude }>;

function toOrganizer(user: OrganizerUser) {
  return {
    ...toPublicUser(user, user.userRoles.map((assignment) => ({ role: { name: assignment.role.name, permissions: [] } }))),
    organization: user.organization,
    department: user.department,
  };
}

async function validatePlacement(organizationId: string, departmentId: string) {
  const organization = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!organization) throw new ApiError(404, "ORGANIZATION_NOT_FOUND", "Organization not found");
  if (organization.status !== "ACTIVE") throw new ApiError(409, "ORGANIZATION_INACTIVE", "Organizer requires an active organization");
  const department = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!department) throw new ApiError(404, "DEPARTMENT_NOT_FOUND", "Department not found");
  if (department.organizationId !== organizationId) throw new ApiError(409, "DEPARTMENT_ORGANIZATION_MISMATCH", "Department does not belong to the organization");
  if (department.status !== "ACTIVE") throw new ApiError(409, "DEPARTMENT_INACTIVE", "Organizer requires an active department");
  return { organization, department };
}

async function getOrganizer(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, include: organizerInclude });
  if (!user || user.role !== "ORGANIZER") throw new ApiError(404, "ORGANIZER_NOT_FOUND", "Organizer not found");
  return toOrganizer(user);
}

export async function listOrganizers(input: { page: number; pageSize: number; search?: string; status?: AccountStatus; organizationId?: string; departmentId?: string }) {
  const where: Prisma.UserWhereInput = { role: "ORGANIZER" };
  if (input.status) where.status = input.status;
  if (input.organizationId) where.organizationId = input.organizationId;
  if (input.departmentId) where.departmentId = input.departmentId;
  if (input.search) {
    where.OR = [
      { email: { contains: input.search, mode: "insensitive" } },
      { firstName: { contains: input.search, mode: "insensitive" } },
      { lastName: { contains: input.search, mode: "insensitive" } },
      { name: { contains: input.search, mode: "insensitive" } },
      { designation: { contains: input.search, mode: "insensitive" } },
    ];
  }
  const [items, total] = await Promise.all([
    prisma.user.findMany({ where, include: organizerInclude, orderBy: [{ createdAt: "desc" }, { id: "asc" }], skip: (input.page - 1) * input.pageSize, take: input.pageSize }),
    prisma.user.count({ where }),
  ]);
  return { items: items.map(toOrganizer), total };
}

export async function createOrganizer(actorId: string, input: { firstName: string; lastName: string; email: string; password: string; name?: string | null; phone?: string | null; designation: string; organizationId: string; departmentId: string }) {
  await validatePlacement(input.organizationId, input.departmentId);
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.role !== "ORGANIZER") throw new ApiError(409, "EMAIL_IN_USE", "Email belongs to another user");
  const organizerRole = await prisma.role.findUnique({ where: { name: "ORGANIZER" } });
  if (!organizerRole) throw new ApiError(500, "ROLE_NOT_CONFIGURED", "Organizer role is not configured");
  const user = existing
    ? await prisma.user.update({ where: { id: existing.id }, data: { firstName: input.firstName, lastName: input.lastName, name: input.name, phone: input.phone, designation: input.designation, organizationId: input.organizationId, departmentId: input.departmentId, status: "ACTIVE" } })
    : await prisma.user.create({ data: { email, passwordHash: await hashPassword(input.password), firstName: input.firstName, lastName: input.lastName, name: input.name, phone: input.phone, designation: input.designation, role: "ORGANIZER", status: "ACTIVE", emailVerified: true, emailVerifiedAt: new Date(), organizationId: input.organizationId, departmentId: input.departmentId, notificationPreference: { create: {} } } });
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { role: "ORGANIZER", organizationId: input.organizationId, departmentId: input.departmentId } }),
    prisma.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: organizerRole.id } }, update: {}, create: { userId: user.id, roleId: organizerRole.id } }),
    prisma.organizationMember.upsert({ where: { organizationId_userId: { organizationId: input.organizationId, userId: user.id } }, update: { departmentId: input.departmentId }, create: { organizationId: input.organizationId, userId: user.id, departmentId: input.departmentId } }),
  ]);
  await recordAudit(actorId, "CREATE_ORGANIZER", "User", user.id, { organizationId: input.organizationId, departmentId: input.departmentId });
  return getOrganizer(user.id);
}

export async function updateOrganizer(actorId: string, id: string, input: { firstName?: string; lastName?: string; name?: string | null; phone?: string | null; designation?: string; organizationId?: string; departmentId?: string }) {
  const existing = await prisma.user.findUnique({ where: { id }, select: { role: true, organizationId: true, departmentId: true } });
  if (!existing || existing.role !== "ORGANIZER") throw new ApiError(404, "ORGANIZER_NOT_FOUND", "Organizer not found");
  const organizationId = input.organizationId ?? existing.organizationId;
  const departmentId = input.departmentId ?? existing.departmentId;
  if (!organizationId || !departmentId) throw new ApiError(400, "PLACEMENT_REQUIRED", "Organization and department are required");
  await validatePlacement(organizationId, departmentId);
  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { firstName: input.firstName, lastName: input.lastName, name: input.name, phone: input.phone, designation: input.designation, organizationId, departmentId } }),
    prisma.organizationMember.upsert({ where: { organizationId_userId: { organizationId, userId: id } }, update: { departmentId }, create: { organizationId, userId: id, departmentId } }),
  ]);
  await recordAudit(actorId, "UPDATE_ORGANIZER", "User", id, { organizationId, departmentId });
  return getOrganizer(id);
}

export async function setOrganizerStatus(actorId: string, id: string, status: AccountStatus) {
  const existing = await prisma.user.findUnique({ where: { id, role: "ORGANIZER" }, select: { status: true } });
  if (!existing) throw new ApiError(404, "ORGANIZER_NOT_FOUND", "Organizer not found");
  await prisma.user.update({ where: { id }, data: { status } });
  const action = status === "ACTIVE" ? "ACTIVATE_ORGANIZER" : status === "SUSPENDED" ? "SUSPEND_ORGANIZER" : "DEACTIVATE_ORGANIZER";
  await recordAudit(actorId, action, "User", id, { status });
  return getOrganizer(id);
}

export { getOrganizer };
