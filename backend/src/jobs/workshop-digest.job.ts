import { prisma } from "../config/database";
import { enqueueEmail } from "./email.job";
import { workshopDigestEmail } from "../integrations/email/email.templates";
import { recommendForUser } from "../modules/recommendations/recommendation.service";

export async function processWorkshopDigests() {
  const participants = await prisma.user.findMany({
    where: { role: "PARTICIPANT", status: "ACTIVE" },
    include: { notificationPreference: true },
  });
  let sent = 0;
  for (const participant of participants) {
    if (participant.notificationPreference?.emailEnabled === false || participant.notificationPreference?.workshopAlerts === false) continue;
    const recommendations = await recommendForUser(participant.id);
    if (recommendations.length === 0) continue;
    const message = workshopDigestEmail(participant.firstName, recommendations.map((item) => ({
      title: item.workshop.title,
      score: item.score,
      workshopId: item.workshop.id,
    })));
    await enqueueEmail({ to: participant.email, ...message });
    sent += 1;
  }
  return { sent };
}

export function startWorkshopDigestScheduler() {
  const interval = setInterval(() => {
    processWorkshopDigests().catch((error) => console.error("[workshop-digest] Failed:", error));
  }, 24 * 60 * 60 * 1000);
  interval.unref?.();
  console.info("[workshop-digest] Daily scheduler started.");
  return interval;
}