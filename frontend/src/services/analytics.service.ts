import { api, unwrap } from "./api";

export async function myAnalytics() {
  return unwrap<Record<string, unknown>>(await api.get("/analytics/me"));
}
export async function organizerAnalytics() {
  return unwrap<Record<string, number>>(await api.get("/analytics/organizer"));
}
export async function platformAnalytics() {
  return unwrap<Record<string, number>>(await api.get("/analytics/platform"));
}
