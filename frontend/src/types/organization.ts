export type Organization = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  status: "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
  departments?: Department[];
  _count?: { users: number; members: number };
};
export type Department = {
  id: string;
  name: string;
  code: string;
  organizationId: string;
  description?: string | null;
  status: "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
  organization?: Organization;
};
