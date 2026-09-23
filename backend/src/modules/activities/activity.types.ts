import type { ActivityType } from "@prisma/client";

export type ActivityInput = {
  workshopId: string;
  title: string;
  description: string;
  type: ActivityType;
  dueAt?: string;
};
