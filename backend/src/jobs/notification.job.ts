import { isRedisConfigured } from "../config/redis";
import { notifyWorkshopPublished } from "../modules/notifications/notification.service";

/**
 * When REDIS_URL is set, publication alerts are queued with BullMQ.
 * Otherwise the same work runs in the request so the LMS still functions.
 */
export async function enqueueWorkshopPublished(workshopId: string) {
  if (!isRedisConfigured()) {
    await notifyWorkshopPublished(workshopId);
    return { mode: "inline" as const };
  }
  try {
    const { Queue } = await import("bullmq");
    const queue = new Queue("notifications", { connection: { url: process.env.REDIS_URL } });
    await queue.add("workshop.published", { workshopId });
    await queue.close();
    return { mode: "queued" as const };
  } catch (error) {
    console.error("Redis queue unavailable, running notification inline", error);
    await notifyWorkshopPublished(workshopId);
    return { mode: "inline" as const };
  }
}

export async function startNotificationWorker() {
  if (!isRedisConfigured()) return;
  const { Worker } = await import("bullmq");
  const worker = new Worker(
    "notifications",
    async (job) => {
      if (job.name === "workshop.published") {
        await notifyWorkshopPublished(job.data.workshopId as string);
      }
    },
    { connection: { url: process.env.REDIS_URL } },
  );
  worker.on("failed", (job, error) => {
    console.error("Notification job failed", job?.id, error);
  });
}
