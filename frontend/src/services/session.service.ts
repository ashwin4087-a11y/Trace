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
