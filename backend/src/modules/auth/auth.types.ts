import type { AccountStatus, PreferredLanguage, RoleName } from "@prisma/client";

export type PublicUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleName;
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
