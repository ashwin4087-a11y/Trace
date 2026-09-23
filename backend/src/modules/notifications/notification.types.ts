import type { NotificationType } from "@prisma/client";

export type NotificationView = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
};
