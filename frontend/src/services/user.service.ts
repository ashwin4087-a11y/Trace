import { api, unwrap } from "./api";
import type { UserRecord } from "../types/user";
import type { AccountStatus, Role } from "../types/auth";

export async function listUsers(params?: { search?: string; role?: Role; status?: AccountStatus }) {
  return unwrap<UserRecord[]>(await api.get("/users", { params }));
}

export async function getUser(id: string) {
  return unwrap<UserRecord>(await api.get(`/users/${id}`));
}

export async function updateUser(id: string, body: Partial<UserRecord>) {
  return unwrap<UserRecord>(await api.patch(`/users/${id}`, body));
}

export async function setUserStatus(id: string, status: string) {
  return unwrap<UserRecord>(await api.patch(`/users/${id}/status`, { status }));
}

export async function assignUserRole(id: string, role: Role) {
  return unwrap<UserRecord>(await api.patch(`/users/${id}/role`, { role }));
}

export async function createOrganizer(body: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationId?: string;
  departmentId?: string;
}) {
  return unwrap<UserRecord>(await api.post("/users/organizers", body));
}
