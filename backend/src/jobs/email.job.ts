import { sendEmail } from "../integrations/email/email.provider";

/** Email delivery is invoked by notification and auth services. This job retries a single message. */
export async function enqueueEmail(message: { to: string; subject: string; text: string; html?: string }) {
  if (!process.env.REDIS_URL) {
    return sendEmail(message);
  }
  try {
    const { Queue } = await import("bullmq");
    const queue = new Queue("email", { connection: { url: process.env.REDIS_URL } });
    await queue.add("send", message);
    await queue.close();
    return { delivered: false, mode: "queued" as const };
  } catch (error) {
    console.error("Email queue unavailable, sending directly", error);
    return sendEmail(message);
  }
}
