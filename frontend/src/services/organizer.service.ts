import { api, unwrap } from "./api";
import type { UserRecord } from "../types/user";
import type { AccountStatus } from "../types/auth";

export type OrganizerInput = {
  firstName: string;
  lastName: string;
  name?: string | null;
  email: string;
  password: string;
  phone?: string | null;
  designation: string;
  organizationId: string;
  departmentId: string;
};

export async function listOrganizers(params?: { search?: string; status?: AccountStatus; organizationId?: string; departmentId?: string }) {
  return unwrap<UserRecord[]>(await api.get("/organizers", { params }));
}

export async function createOrganizer(body: OrganizerInput) {
  return unwrap<UserRecord>(await api.post("/organizers", body));
}

export async function updateOrganizer(id: string, body: Partial<Omit<OrganizerInput, "email" | "password">>) {
  return unwrap<UserRecord>(await api.patch(`/organizers/${id}`, body));
}

export async function setOrganizerStatus(id: string, status: AccountStatus) {
  return unwrap<UserRecord>(await api.patch(`/organizers/${id}/status`, { status }));
}
