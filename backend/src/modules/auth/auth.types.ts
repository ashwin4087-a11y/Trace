import type { AccountStatus, PreferredLanguage, UserRole } from "@prisma/client";

export type PublicUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: AccountStatus;
  preferredLanguage: PreferredLanguage;
  emailVerifiedAt: string | null;
  organizationId: string | null;
  departmentId: string | null;
};

export type AuthResult = {
  accessToken: string;
  user: PublicUser;
};
