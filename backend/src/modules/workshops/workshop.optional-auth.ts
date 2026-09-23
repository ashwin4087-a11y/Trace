import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/database";
import { env } from "../../config/environment";
import { mockUserFromEnv } from "../../shared/auth/dev-user.adapter";
import { verifyAccessToken } from "../../shared/utils/tokens";

/** Attaches req.user when a bearer token is present. Public catalog stays readable. */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    const mock = mockUserFromEnv({ ...process.env, NODE_ENV: env.nodeEnv });
    if (mock) req.user = mock;
    next();
    return;
  }
  try {
    const payload = verifyAccessToken(header.slice(7));
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (user && user.status !== "SUSPENDED") {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        organizationId: user.organizationId,
        departmentId: user.departmentId,
        roles: [user.role],
        permissions: [],
      };
    }
  } catch {
    // Ignore invalid tokens on public reads.
  }
  next();
}
