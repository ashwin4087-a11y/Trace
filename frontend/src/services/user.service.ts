import { api, unwrap } from "./api";
import type { UserRecord } from "../types/user";

export async function listUsers(params?: { search?: string; role?: string; status?: string }) {
  return unwrap<UserRecord[]>(await api.get("/users", { params }));
}

export async function updateUser(id: string, body: Partial<UserRecord>) {
  return unwrap<UserRecord>(await api.patch(`/users/${id}`, body));
}

export async function setUserStatus(id: string, status: string) {
  return unwrap<UserRecord>(await api.patch(`/users/${id}/status`, { status }));
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
