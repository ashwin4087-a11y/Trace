import type { MaterialType } from "@prisma/client";

export type MaterialInput = {
  workshopId: string;
  sessionId?: string;
  title: string;
  type: MaterialType;
  url: string;
};
