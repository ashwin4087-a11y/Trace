export type Role = "ADMIN" | "ORGANIZER" | "PARTICIPANT";
export type AccountStatus = "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: AccountStatus;
  preferredLanguage: "EN" | "TA" | "EN_TA";
  emailVerifiedAt: string | null;
  organizationId: string | null;
  departmentId: string | null;
  roles: Role[];
  permissions: string[];
};
