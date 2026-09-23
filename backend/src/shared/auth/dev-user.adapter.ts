import type { NextFunction, Request, Response } from "express";
import type { RoleName } from "@prisma/client";
import { env } from "../../config/environment";
import type { AuthUser } from "../types/http";

/**
 * Development-only stand-in for Member 1's auth middleware.
 * It does not issue tokens, hash passwords, or create users.
 * Enable with DEV_MOCK_USER=true and an existing DEV_MOCK_USER_ID.
 * Ignored when NODE_ENV is production.
 */
export function devMockAllowed(input: { nodeEnv: string; flag?: string }): boolean {
  return input.nodeEnv !== "production" && input.flag === "true";
}

export function mockUserFromEnv(envValues: NodeJS.ProcessEnv): AuthUser | null {
  if (!devMockAllowed({ nodeEnv: envValues.NODE_ENV ?? "development", flag: envValues.DEV_MOCK_USER })) {
    return null;
  }
  const id = envValues.DEV_MOCK_USER_ID;
  const role = envValues.DEV_MOCK_USER_ROLE;
  if (!id || (role !== "ADMIN" && role !== "ORGANIZER" && role !== "PARTICIPANT")) {
    return null;
  }
  return {
    id,
    email: envValues.DEV_MOCK_USER_EMAIL || "dev-mock@aurex.local",
    role: role as RoleName,
    status: "ACTIVE",
    organizationId: envValues.DEV_MOCK_ORGANIZATION_ID || null,
    departmentId: envValues.DEV_MOCK_DEPARTMENT_ID || null,
    roles: [role as RoleName],
    permissions: [],
  };
}

export function applyDevMockUser(req: Request, _res: Response, next: NextFunction) {
  const mock = mockUserFromEnv({ ...process.env, NODE_ENV: env.nodeEnv });
  if (mock && !req.user) {
    req.user = mock;
  }
  next();
}
