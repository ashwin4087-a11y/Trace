import type { AccountStatus, Prisma, RoleName } from "@prisma/client";
import { prisma } from "../../config/database";
import { ApiError } from "../../shared/errors/api-error";
import { hashPassword } from "../../shared/utils/tokens";
import { recordAudit } from "../audit/audit.service";
import { toPublicUser } from "../auth/auth.service";

export async function listUsers(input: {
  page: number;
  pageSize: number;
  search?: string;
  role?: RoleName;
  status?: AccountStatus;
}) {
  const where: Prisma.UserWhereInput = {};
  if (input.role) where.role = input.role;
  if (input.status) where.status = input.status;
  if (input.search) {
    where.OR = [
      { email: { contains: input.search, mode: "insensitive" } },
      { firstName: { contains: input.search, mode: "insensitive" } },
      { lastName: { contains: input.search, mode: "insensitive" } },
    ];
  }
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    }),
    prisma.user.count({ where }),
  ]);
  return { items: items.map(toPublicUser), total };
}

export async function getUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new ApiError(404, "NOT_FOUND", "User not found");
  return toPublicUser(user);
}

export async function updateUser(
  actorId: string,
  id: string,
  input: {
    firstName?: string;
    lastName?: string;
    role?: RoleName;
    organizationId?: string | null;
    departmentId?: string | null;
    preferredLanguage?: "EN" | "TA" | "EN_TA";
  },
) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "NOT_FOUND", "User not found");
  const user = await prisma.user.update({ where: { id }, data: input });
  if (input.role && input.role !== existing.role) {
    await recordAudit(actorId, "CHANGE_ROLE", "User", id, {
      from: existing.role,
      to: input.role,
    });
    if (input.role === "ORGANIZER") {
      await recordAudit(actorId, "CREATE_ORGANIZER", "User", id);
    }
  } else {
    await recordAudit(actorId, "UPDATE_USER", "User", id);
  }
  return toPublicUser(user);
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
  await recordAudit(actorId, "CREATE_ORGANIZER", "User", user.id);
  return toPublicUser(user);
}

export async function setStatus(actorId: string, id: string, status: AccountStatus) {
  const user = await prisma.user.update({ where: { id }, data: { status } });
  await recordAudit(actorId, status === "SUSPENDED" ? "SUSPEND_USER" : "UPDATE_USER", "User", id, {
    status,
  });
  return toPublicUser(user);
}
