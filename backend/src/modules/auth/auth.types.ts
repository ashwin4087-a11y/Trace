import type { AccountStatus, PreferredLanguage, RoleName } from "@prisma/client";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  designation: string | null;
  role: RoleName;
  status: AccountStatus;
  emailVerified: boolean;
  preferredLanguage: PreferredLanguage;
  emailVerifiedAt: string | null;
  organizationId: string | null;
  departmentId: string | null;
  roles: RoleName[];
  permissions: string[];
  createdAt: string;
  updatedAt: string;
};

export type AuthResult = {
  accessToken: string;
  user: PublicUser;
};

