import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/database";
import { verifyAccessToken } from "../../shared/utils/tokens";

/** Attaches req.user when a bearer token is present. Public catalog stays readable. */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next();
    return;
  }
  try {
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
    if (user && user.status !== "SUSPENDED") {
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
    }
  } catch {
    // Ignore invalid tokens on public reads.
  }
  next();
}
