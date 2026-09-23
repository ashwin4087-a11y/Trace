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
