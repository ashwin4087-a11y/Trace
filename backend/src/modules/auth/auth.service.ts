import type { Response } from "express";
import type { RoleName, User } from "@prisma/client";
import { prisma } from "../../config/database";
import { env } from "../../config/environment";
import { sendEmail } from "../../integrations/email/email.provider";
import { resetEmail, verificationEmail } from "../../integrations/email/email.templates";
import { ApiError } from "../../shared/errors/api-error";
import {
  hashPassword,
  randomToken,
  refreshExpiry,
  sha256,
  signAccessToken,
  verifyPassword,
} from "../../shared/utils/tokens";
import type { AuthResult, PublicUser } from "./auth.types";
import { recordAudit } from "../audit/audit.service";

const REFRESH_COOKIE = "refreshToken";

export type AccessAssignment = {
  role: {
    name: RoleName;
    permissions: { permission: { key: string } }[];
  };
};

function accessFor(assignments: AccessAssignment[] | undefined, fallback: RoleName) {
  const roles = assignments?.length ? assignments.map((assignment) => assignment.role.name) : [fallback];
  const permissions = assignments?.flatMap((assignment) =>
    assignment.role.permissions.map((rolePermission) => rolePermission.permission.key),
  ) ?? [];
  return { roles: [...new Set(roles)], permissions: [...new Set(permissions)] };
}

export function toPublicUser(user: User, assignments?: AccessAssignment[]): PublicUser {
  const access = accessFor(assignments, user.role);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    designation: user.designation,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
    preferredLanguage: user.preferredLanguage,
    emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
    organizationId: user.organizationId,
    departmentId: user.departmentId,
    roles: access.roles,
    permissions: access.permissions,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

async function publicUserById(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { userRoles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
  });
  if (!user) throw new ApiError(401, "UNAUTHENTICATED", "Authentication required");
  return toPublicUser(user, user.userRoles);
}

export function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.isProd,
    path: "/api/auth",
    maxAge: env.jwtRefreshTtlDays * 24 * 60 * 60 * 1000,
  });
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
}

export function readRefreshCookie(req: { cookies?: Record<string, string> }): string | undefined {
  return req.cookies?.[REFRESH_COOKIE];
}

async function issueSession(user: User, res: Response): Promise<AuthResult> {
  const rawRefresh = randomToken();
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256(rawRefresh),
      expiresAt: refreshExpiry(),
    },
  });
  setRefreshCookie(res, rawRefresh);
  return {
    accessToken: signAccessToken({ sub: user.id, role: user.role }),
    user: await publicUserById(user.id),
  };
}

export async function register(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  preferredLanguage: "EN" | "TA" | "EN_TA";
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) {
    throw new ApiError(409, "EMAIL_IN_USE", "An account with this email already exists");
  }
  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash: await hashPassword(input.password),
      firstName: input.firstName,
      lastName: input.lastName,
      preferredLanguage: input.preferredLanguage,
      role: "PARTICIPANT",
      status: "PENDING_VERIFICATION",
      notificationPreference: { create: {} },
    },
  });
  const participantRole = await prisma.role.findUnique({ where: { name: "PARTICIPANT" } });
  if (participantRole) {
    await prisma.userRole.create({ data: { userId: user.id, roleId: participantRole.id } });
  }
  const token = randomToken();
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256(token),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });
  const message = verificationEmail(user.firstName, token);
  await sendEmail({ to: user.email, ...message });
  await recordAudit(user.id, "CREATE_USER", "User", user.id, { source: "register" });
  return toPublicUser(user);
}

export async function login(email: string, password: string, res: Response) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { userRoles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
  });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
  }
  if (user.status === "SUSPENDED" || user.status === "DEACTIVATED") {
    throw new ApiError(403, "ACCOUNT_DISABLED", "This account is not active");
  }
  const session = await issueSession(user, res);
  await recordAudit(user.id, "LOGIN", "User", user.id);
  return session;
}

export async function refresh(rawToken: string | undefined, res: Response) {
  if (!rawToken) {
    throw new ApiError(401, "UNAUTHENTICATED", "Refresh token missing");
  }
  const existing = await prisma.refreshToken.findUnique({
    where: { tokenHash: sha256(rawToken) },
    include: { user: true },
  });
  if (!existing || existing.revokedAt || existing.expiresAt.getTime() < Date.now()) {
    throw new ApiError(401, "UNAUTHENTICATED", "Refresh token is invalid");
  }
  if (existing.user.status === "SUSPENDED") {
    throw new ApiError(403, "ACCOUNT_SUSPENDED", "This account is suspended");
  }
  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revokedAt: new Date() },
  });
  return issueSession(existing.user, res);
}

export async function logout(rawToken: string | undefined, userId: string | undefined, res: Response) {
  if (rawToken) {
    await prisma.refreshToken.updateMany({
      where: { tokenHash: sha256(rawToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  clearRefreshCookie(res);
  if (userId) {
    await recordAudit(userId, "LOGOUT", "User", userId);
  }
}

export async function verifyEmail(token: string) {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: sha256(token) },
  });
  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    throw new ApiError(400, "INVALID_TOKEN", "Verification link is invalid or expired");
  }
  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { status: "ACTIVE", emailVerified: true, emailVerifiedAt: new Date() },
    }),
  ]);
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return;
  const token = randomToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256(token),
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
    },
  });
  const message = resetEmail(user.firstName, token);
  await sendEmail({ to: user.email, ...message });
}

export async function resetPassword(token: string, password: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: sha256(token) },
  });
  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    throw new ApiError(400, "INVALID_TOKEN", "Reset link is invalid or expired");
  }
  await prisma.$transaction([
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: await hashPassword(password) },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}

export async function currentUser(userId: string) {
  return publicUserById(userId);
}
