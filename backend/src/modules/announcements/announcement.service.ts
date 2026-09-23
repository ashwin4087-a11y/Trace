import { prisma } from "../../config/database";
import type { AuthUser } from "../../shared/types/http";
import { notifyAnnouncement } from "../notifications/notification.service";
import { assertCanManageWorkshop } from "../workshops/workshop.service";

export async function listAnnouncements(workshopId?: string) {
  return prisma.announcement.findMany({
    where: workshopId ? { workshopId } : undefined,
    include: { author: { select: { firstName: true, lastName: true } }, workshop: { select: { title: true } } },
    orderBy: { publishedAt: "desc" },
  });
}

export async function createAnnouncement(user: AuthUser, input: { workshopId: string; title: string; body: string }) {
  await assertCanManageWorkshop(user, input.workshopId);
  const announcement = await prisma.announcement.create({
    data: { ...input, authorId: user.id },
  });
  const registrations = await prisma.registration.findMany({
    where: { workshopId: input.workshopId, status: "CONFIRMED" },
    select: { userId: true },
  });
  await notifyAnnouncement(
    registrations.map((item) => item.userId),
    input.title,
    input.body,
    `/workshops/${input.workshopId}`,
  );
  return announcement;
}
