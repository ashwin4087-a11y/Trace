import type { NextFunction, Request, Response } from "express";
import type { RoleName } from "@prisma/client";
import { ApiError } from "../shared/errors/api-error";

export function requireRoles(...roles: RoleName[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.some((role) => req.user!.roles.includes(role))) {
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
    if (!req.user.permissions.includes(key)) {
      next(new ApiError(403, "FORBIDDEN", "Missing permission"));
      return;
    }
    next();
  };
}
