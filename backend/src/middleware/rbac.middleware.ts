import type { NextFunction, Request, Response } from "express";
import type { RoleName } from "@prisma/client";
import { prisma } from "../config/database";
import { ApiError } from "../shared/errors/api-error";

export function requireRoles(...roles: RoleName[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new ApiError(403, "FORBIDDEN", "You do not have permission to perform this action"));
      return;
    }
    next();
  };
}

export function requirePermission(key: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new ApiError(401, "UNAUTHENTICATED", "Authentication required"));
      return;
    }
    const match = await prisma.rolePermission.findFirst({
      where: {
        role: { name: req.user.role },
        permission: { key },
      },
    });
    if (!match) {
      next(new ApiError(403, "FORBIDDEN", "Missing permission"));
      return;
    }
    next();
  };
}
