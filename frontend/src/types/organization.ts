export type Organization = { id: string; name: string; code: string; description?: string | null };
export type Department = {
  id: string;
  name: string;
  code: string;
  organizationId: string;
  organization?: Organization;
};
