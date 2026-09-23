import { api, unwrap } from "./api";
import type { WorkshopSession } from "../types/session";

export async function listSessions(workshopId: string) {
  return unwrap<WorkshopSession[]>(await api.get("/sessions", { params: { workshopId } }));
}
export async function createSession(body: Record<string, unknown>) {
  return unwrap<WorkshopSession>(await api.post("/sessions", body));
}
export async function issueQr(sessionId: string) {
  return unwrap<{ token: string }>(await api.post(`/sessions/${sessionId}/qr`));
}
export async function updateSession(sessionId: string, body: Record<string, unknown>) {
  return unwrap<WorkshopSession>(await api.patch(`/sessions/${sessionId}`, body));
}
export async function getSessionAccess(sessionId: string) {
  return unwrap<{ access: string; meetingUrl?: string; monitoringSession?: any }>(await api.get(`/sessions/${sessionId}/access`));
}
