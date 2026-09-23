import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database";
import { mockUserFromEnv } from "../shared/auth/dev-user.adapter";
import { ApiError } from "../shared/errors/api-error";
import { verifyAccessToken } from "../shared/utils/tokens";
import { env } from "../config/environment";

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const mock = mockUserFromEnv({ ...process.env, NODE_ENV: env.nodeEnv });
  if (mock) {
    req.user = mock;
    next();
    return;
  }
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new ApiError(401, "UNAUTHENTICATED", "Authentication required");
    }
    const payload = verifyAccessToken(header.slice(7));
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: {
          include: {
            role: { include: { permissions: { include: { permission: true } } } },
          },
        },
      },
    });
    if (!user) {
      throw new ApiError(401, "UNAUTHENTICATED", "Authentication required");
    }
    if (user.status === "SUSPENDED" || user.status === "DEACTIVATED") {
      throw new ApiError(403, "ACCOUNT_DISABLED", "This account is not active");
    }
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      organizationId: user.organizationId,
      departmentId: user.departmentId,
      roles: user.userRoles.length ? user.userRoles.map((assignment) => assignment.role.name) : [user.role],
      permissions: user.userRoles.flatMap((assignment) =>
        assignment.role.permissions.map((rolePermission) => rolePermission.permission.key),
      ),
    };
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }
    next(new ApiError(401, "UNAUTHENTICATED", "Authentication required"));
  }
}

export function requireVerified(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    next(new ApiError(401, "UNAUTHENTICATED", "Authentication required"));
    return;
  }
  if (req.user.status !== "ACTIVE") {
    next(new ApiError(403, "EMAIL_NOT_VERIFIED", "Verify your email before continuing"));
    return;
  }
  next();
}
