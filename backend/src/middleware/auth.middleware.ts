import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database";
import { ApiError } from "../shared/errors/api-error";
import { verifyAccessToken } from "../shared/utils/tokens";

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new ApiError(401, "UNAUTHENTICATED", "Authentication required");
    }
    const payload = verifyAccessToken(header.slice(7));
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new ApiError(401, "UNAUTHENTICATED", "Authentication required");
    }
    if (user.status === "SUSPENDED") {
      throw new ApiError(403, "ACCOUNT_SUSPENDED", "This account is suspended");
    }
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      organizationId: user.organizationId,
      departmentId: user.departmentId,
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
