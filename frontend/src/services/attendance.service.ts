import { api, unwrap } from "./api";
import type { AttendanceRecord, AttendanceSummary } from "../types/attendance";

export async function myAttendance(workshopId?: string) {
  return unwrap<AttendanceRecord[]>(await api.get("/attendance/me", { params: { workshopId } }));
}
export async function summary(workshopId: string, userId?: string) {
  return unwrap<AttendanceSummary>(await api.get(`/attendance/workshops/${workshopId}/summary`, { params: { userId } }));
}
export async function workshopAttendance(workshopId: string) {
  return unwrap<AttendanceRecord[]>(await api.get(`/attendance/workshops/${workshopId}`));
}
export async function sessionAttendance(sessionId: string) {
  return unwrap<any[]>(await api.get(`/attendance/sessions/${sessionId}/attendance`));
}
export async function markAttendance(body: { sessionId: string; userId: string; status: string; note?: string }) {
  return unwrap<AttendanceRecord>(await api.post("/attendance", body));
}
export async function checkIn(token: string) {
  return unwrap<AttendanceRecord>(await api.post("/attendance/qr", { token }));
}

// AUREX 2026 QR & Monitoring
export async function generateMyQr(sessionId: string) {
  return unwrap<{ qrPayload: string; expiresIn: number; sessionId: string; passcode: string; scanUrl?: string }>(await api.get(`/sessions/${sessionId}/my-attendance-qr`));
}
export async function getSessionStatus(sessionId: string) {
  return unwrap<{ status: string; recordedAt?: string; monitoringSession?: { id: string, status: string } }>(await api.get(`/sessions/${sessionId}/status`));
}
export async function verifyMyQr(sessionId: string, token: string) {
  return unwrap<any>(await api.post(`/attendance/qr/verify`, { sessionId, token }));
}
export async function heartbeat(monitoringSessionId: string) {
  return unwrap<any>(await api.post(`/attendance-sessions/${monitoringSessionId}/heartbeat`));
}
export async function recordEvent(monitoringSessionId: string, type: string) {
  return unwrap<any>(await api.post(`/attendance-sessions/${monitoringSessionId}/event`, { type, clientTime: new Date().toISOString() }));
}
