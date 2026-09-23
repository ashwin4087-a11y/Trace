import { api, unwrap } from "./api";
import type { AttendanceRecord, AttendanceSummary } from "../types/attendance";

export async function myAttendance() {
  return unwrap<AttendanceRecord[]>(await api.get("/attendance/me"));
}
export async function summary(workshopId: string, userId?: string) {
  return unwrap<AttendanceSummary>(await api.get(`/attendance/workshops/${workshopId}/summary`, { params: { userId } }));
}
export async function workshopAttendance(workshopId: string) {
  return unwrap<AttendanceRecord[]>(await api.get(`/attendance/workshops/${workshopId}`));
}
export async function markAttendance(body: { sessionId: string; userId: string; status: string; note?: string }) {
  return unwrap<AttendanceRecord>(await api.post("/attendance", body));
}
export async function checkIn(token: string) {
  return unwrap<AttendanceRecord>(await api.post("/attendance/qr", { token }));
}

// AUREX 2026 QR & Monitoring
export async function generateMyQr(sessionId: string) {
  return unwrap<{ qrPayload: string; expiresIn: number; sessionId: string }>(await api.get(`/sessions/${sessionId}/my-attendance-qr`));
}
export async function verifyMyQr(sessionId: string, token: string) {
  return unwrap<any>(await api.post(`/qr/verify`, { sessionId, token }));
}
export async function heartbeat(monitoringSessionId: string) {
  return unwrap<any>(await api.post(`/attendance-sessions/${monitoringSessionId}/heartbeat`));
}
export async function recordEvent(monitoringSessionId: string, type: string) {
  return unwrap<any>(await api.post(`/attendance-sessions/${monitoringSessionId}/event`, { type, clientTime: new Date().toISOString() }));
}
