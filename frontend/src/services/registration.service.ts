import { api, unwrap } from "./api";
import type { Registration } from "../types/registration";

export async function register(workshopId: string) {
  return unwrap<Registration>(await api.post("/registrations", { workshopId }));
}
export async function myRegistrations() {
  return unwrap<Registration[]>(await api.get("/registrations/me"));
}
export async function workshopRegistrations(workshopId: string) {
  return unwrap<Registration[]>(await api.get("/registrations", { params: { workshopId } }));
}
export async function cancelRegistration(id: string) {
  return unwrap<Registration>(await api.delete(`/registrations/${id}`));
}
