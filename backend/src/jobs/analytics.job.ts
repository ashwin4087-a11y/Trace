import type { Prisma } from "@prisma/client";
import { prisma } from "../config/database";

/** Stores a lightweight analytics event. Aggregation itself lives in the analytics module. */
export async function recordAnalyticsEvent(type: string, payload: Record<string, unknown>, userId?: string) {
  if (process.env.REDIS_URL) {
    try {
      const { Queue } = await import("bullmq");
      const queue = new Queue("analytics", { connection: { url: process.env.REDIS_URL } });
      await queue.add("event", { type, payload, userId });
      await queue.close();
      return;
    } catch (error) {
      console.error("Analytics queue unavailable, writing directly", error);
    }
  }
  await prisma.analyticsEvent.create({
    data: { type, payload: payload as Prisma.InputJsonValue, userId },
  });
}
