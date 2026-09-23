import type { AccountStatus, PreferredLanguage, UserRole } from "@prisma/client";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRole;
  status: AccountStatus;
  emailVerified: boolean;
  preferredLanguage: PreferredLanguage;
  emailVerifiedAt: string | null;
  organizationId: string | null;
  departmentId: string | null;
  roles: UserRole[];
  permissions: string[];
  createdAt: string;
  updatedAt: string;
};

export type AuthResult = {
  accessToken: string;
  user: PublicUser;
};

