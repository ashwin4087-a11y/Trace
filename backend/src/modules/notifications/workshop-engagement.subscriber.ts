import { prisma } from "../../config/database";
import { onWorkshopDomainEvent } from "../workshops/workshop.events";
import { notifyAnnouncement, notifyCertificate, notifyRegistration, notifyWorkshopPublished } from "./notification.service";

let registered = false;

/**
 * Member 3 reaction to workshop-domain events.
 * Workshop, registration, payment, certificate, and announcement services do not import this module.
 */
export function registerWorkshopEngagement() {
  if (registered) return;
  registered = true;
  onWorkshopDomainEvent(async (event) => {
    if (event.type === "WORKSHOP_PUBLISHED") {
      await prisma.community.upsert({
        where: { workshopId: event.workshopId },
        update: {},
        create: {
          workshopId: event.workshopId,
          name: `${event.title} community`,
          description: "Workshop discussion space",
        },
      });
      await notifyWorkshopPublished(event.workshopId);
      return;
    }
    if (event.type === "REGISTRATION_CONFIRMED") {
      await notifyRegistration(event.userId, event.workshopTitle, event.workshopId);
      const community = await prisma.community.findUnique({ where: { workshopId: event.workshopId } });
      if (community) {
        await prisma.communityMember.upsert({
          where: { communityId_userId: { communityId: community.id, userId: event.userId } },
          update: {},
          create: { communityId: community.id, userId: event.userId },
        });
      }
      return;
    }
    if (event.type === "CERTIFICATE_ISSUED") {
      await notifyCertificate(event.userId, event.workshopTitle, event.certificateCode);
      return;
    }
    if (event.type === "ANNOUNCEMENT_PUBLISHED") {
      await notifyAnnouncement(event.recipientUserIds, event.title, event.body, `/workshops/${event.workshopId}`);
    }
  });
}
