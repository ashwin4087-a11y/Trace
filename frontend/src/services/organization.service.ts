import { api, unwrap } from "./api";
import type { Department, Organization } from "../types/organization";

export async function listOrganizations() {
  return unwrap<Organization[]>(await api.get("/organizations"));
}
export async function getOrganization(id: string) {
  return unwrap<Organization>(await api.get(`/organizations/${id}`));
}
export async function createOrganization(body: { name: string; code: string; description?: string }) {
  return unwrap<Organization>(await api.post("/organizations", body));
}
export async function updateOrganization(id: string, body: { name?: string; code?: string; description?: string }) {
  return unwrap<Organization>(await api.patch(`/organizations/${id}`, body));
}
export async function setOrganizationStatus(id: string, status: string) {
  return unwrap<Organization>(await api.patch(`/organizations/${id}/status`, { status }));
}
export async function listDepartments(organizationId?: string) {
  return unwrap<Department[]>(await api.get("/departments", { params: { organizationId } }));
}
export async function getDepartment(id: string) {
  return unwrap<Department>(await api.get(`/departments/${id}`));
}
export async function createDepartment(body: { organizationId: string; name: string; code: string; description?: string }) {
  return unwrap<Department>(await api.post("/departments", body));
}
export async function updateDepartment(id: string, body: { name?: string; code?: string; description?: string }) {
  return unwrap<Department>(await api.patch(`/departments/${id}`, body));
}
export async function setDepartmentStatus(id: string, status: string) {
  return unwrap<Department>(await api.patch(`/departments/${id}/status`, { status }));
}
