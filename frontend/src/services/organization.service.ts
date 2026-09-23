import { api, unwrap } from "./api";
import type { Department, Organization } from "../types/organization";

export async function listOrganizations() {
  return unwrap<Organization[]>(await api.get("/organizations"));
}
export async function createOrganization(body: { name: string; code: string; description?: string }) {
  return unwrap<Organization>(await api.post("/organizations", body));
}
export async function listDepartments(organizationId?: string) {
  return unwrap<Department[]>(await api.get("/departments", { params: { organizationId } }));
}
export async function createDepartment(body: { organizationId: string; name: string; code: string }) {
  return unwrap<Department>(await api.post("/departments", body));
}
