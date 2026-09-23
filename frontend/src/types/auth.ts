export type Role = "ADMIN" | "ORGANIZER" | "PARTICIPANT";
export type AccountStatus = "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | "DEACTIVATED";

export type AuthUser = {
  id: string;
  name: string | null;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  designation: string | null;
  role: Role;
  status: AccountStatus;
  emailVerified: boolean;
  preferredLanguage: "EN" | "TA" | "EN_TA";
  emailVerifiedAt: string | null;
  organizationId: string | null;
  departmentId: string | null;
  roles: Role[];
  permissions: string[];
  createdAt: string;
  updatedAt: string;
};
