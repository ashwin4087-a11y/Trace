import { api, unwrap } from "./api";

export async function myAnalytics() {
  return unwrap<Record<string, unknown>>(await api.get("/analytics/me"));
}
export async function organizerAnalytics(workshopId?: string) {
  return unwrap<Record<string, number>>(await api.get("/analytics/organizer", { params: { workshopId } }));
}
export async function platformAnalytics() {
  return unwrap<Record<string, number>>(await api.get("/analytics/platform"));
}
