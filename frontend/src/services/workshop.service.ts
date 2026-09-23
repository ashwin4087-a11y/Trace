import { api, unwrap } from "./api";
import type { Workshop } from "../types/workshop";

export async function listWorkshops(params?: Record<string, string | number | undefined>) {
  return unwrap<Workshop[]>(await api.get("/workshops", { params }));
}
export async function getWorkshop(id: string) {
  return unwrap<Workshop>(await api.get(`/workshops/${id}`));
}
export async function createWorkshop(body: Record<string, unknown>) {
  return unwrap<Workshop>(await api.post("/workshops", body));
}
export async function updateWorkshop(id: string, body: Record<string, unknown>) {
  return unwrap<Workshop>(await api.patch(`/workshops/${id}`, body));
}
export async function publishWorkshop(id: string) {
  return unwrap<Workshop>(await api.post(`/workshops/${id}/publish`));
}
export async function completeWorkshop(id: string) {
  return unwrap<Workshop>(await api.post(`/workshops/${id}/complete`));
}
