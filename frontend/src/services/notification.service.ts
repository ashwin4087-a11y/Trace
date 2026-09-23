import { api, unwrap } from "./api";
import type { AppNotification } from "../types/notification";

export async function listNotifications() {
  return unwrap<AppNotification[]>(await api.get("/notifications"));
}
export async function markRead(id: string) {
  return unwrap<{ read: boolean }>(await api.post(`/notifications/${id}/read`));
}
export async function markAllRead() {
  return unwrap<{ read: boolean }>(await api.post("/notifications/read-all"));
}
