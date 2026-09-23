import type { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { sendEmail } from "../../integrations/email/email.provider";
import { certificateEmail, registrationEmail, workshopAlertEmail } from "../../integrations/email/email.templates";
import { scoreWorkshop } from "../../shared/utils/recommendations";
import { getSettings } from "../settings/settings.service";

async function deliver(input: {
  userId: string;
  email: string;
  firstName: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  emailMessage?: { subject: string; text: string; html?: string };
  preference: {
    emailEnabled: boolean;
    inAppEnabled: boolean;
    workshopAlerts: boolean;
    sessionReminders: boolean;
    certificateAlerts: boolean;
  } | null;
}) {
  const prefs = input.preference;
  const allowType =
    input.type === "WORKSHOP_PUBLISHED"
      ? prefs?.workshopAlerts !== false
      : input.type === "SESSION_REMINDER"
        ? prefs?.sessionReminders !== false
        : input.type === "CERTIFICATE_ISSUED"
          ? prefs?.certificateAlerts !== false
          : true;

  if (!allowType) return;

  if (prefs?.inAppEnabled !== false) {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        link: input.link,
      },
    });
  }
  if (prefs?.emailEnabled !== false && input.emailMessage) {
    await sendEmail({ to: input.email, ...input.emailMessage });
  }
}

export async function notifyWorkshopPublished(workshopId: string) {
  const settings = await getSettings();
  if (!settings.notificationsEnabled) return { notified: 0 };

  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
    include: { skills: { include: { skill: true } }, department: true },
  });
  if (!workshop || workshop.status !== "PUBLISHED") return { notified: 0 };

  const participants = await prisma.user.findMany({
    where: { role: "PARTICIPANT", status: "ACTIVE" },
    include: {
      academicProfile: true,
      interests: true,
      skills: { include: { skill: true } },
      notificationPreference: true,
      department: true,
    },
  });

  let notified = 0;
  for (const participant of participants) {
    const scored = scoreWorkshop(
      {
        domain: participant.academicProfile?.domain,
        departmentName: participant.academicProfile?.departmentName ?? participant.department?.name,
        year: participant.academicProfile?.year,
        skills: participant.skills.map((item) => item.skill.name),
        interests: participant.interests.map((item) => item.label),
        language: participant.preferredLanguage,
      },
      {
        id: workshop.id,
        domain: workshop.domain,
        departmentName: workshop.department?.name,
        level: workshop.level,
        language: workshop.language,
        skills: workshop.skills.map((item) => item.skill.name),
        category: workshop.category,
        title: workshop.title,
      },
    );
    if (scored.score < 15) continue;
    const emailMessage = workshopAlertEmail(participant.firstName, workshop.title, workshop.id);
    await deliver({
      userId: participant.id,
      email: participant.email,
      firstName: participant.firstName,
      type: "WORKSHOP_PUBLISHED",
      title: workshop.title,
      body: scored.reasons.join(". ") || "A workshop matches your profile.",
      link: `/workshops/${workshop.id}`,
      emailMessage,
      preference: participant.notificationPreference,
    });
    await prisma.recommendation.upsert({
      where: { userId_workshopId: { userId: participant.id, workshopId: workshop.id } },
      update: { score: scored.score, reasons: scored.reasons },
      create: {
        userId: participant.id,
        workshopId: workshop.id,
        score: scored.score,
        reasons: scored.reasons,
      },
    });
    notified += 1;
  }
  return { notified };
}

export async function notifyRegistration(userId: string, workshopTitle: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { notificationPreference: true },
  });
  if (!user) return;
  await deliver({
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    type: "REGISTRATION_CONFIRMED",
    title: `Registered: ${workshopTitle}`,
    body: `Your registration for ${workshopTitle} is confirmed.`,
    emailMessage: registrationEmail(user.firstName, workshopTitle),
    preference: user.notificationPreference,
  });
}

export async function notifyCertificate(userId: string, workshopTitle: string, code: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { notificationPreference: true },
  });
  if (!user) return;
  await deliver({
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    type: "CERTIFICATE_ISSUED",
    title: `Certificate ready: ${workshopTitle}`,
    body: `Certificate ${code} was issued after attendance verification.`,
    link: `/verify/${code}`,
    emailMessage: certificateEmail(user.firstName, workshopTitle, code),
    preference: user.notificationPreference,
  });
}

export async function notifyAnnouncement(userIds: string[], title: string, body: string, link?: string) {
  if (!userIds.length) return;
  await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type: "ANNOUNCEMENT" as const,
      title,
      body,
      link,
    })),
  });
}

export async function listMine(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function markRead(userId: string, id: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { readAt: new Date() },
  });
}

export async function markAllRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function getPreferences(userId: string) {
  return prisma.notificationPreference.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function updatePreferences(
  userId: string,
  input: Prisma.NotificationPreferenceUpdateInput,
) {
  return prisma.notificationPreference.upsert({
    where: { userId },
    update: input,
    create: { userId },
  });
}
