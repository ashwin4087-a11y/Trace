import type { AccountStatus, UserRole } from "@prisma/client";

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  organizationId: string | null;
  departmentId: string | null;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
