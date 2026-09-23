import { prisma } from "../../config/database";
import { ApiError } from "../../shared/errors/api-error";
import { decideRegistration } from "../../shared/utils/registration-rules";
import { getSettings } from "../settings/settings.service";
import { emitWorkshopDomainEvent } from "../workshops/workshop.events";

export async function registerForWorkshop(userId: string, workshopId: string) {
  const settings = await getSettings();
  if (!settings.registrationOpen) {
    throw new ApiError(403, "REGISTRATION_CLOSED", "Platform registration is closed");
  }

  const registration = await prisma.$transaction(async (tx) => {
    const workshop = await tx.workshop.findUnique({ where: { id: workshopId } });
    if (!workshop) throw new ApiError(404, "NOT_FOUND", "Workshop not found");

    const existing = await tx.registration.findUnique({
      where: { workshopId_userId: { workshopId, userId } },
    });
    if (existing && existing.status !== "CANCELLED") {
      throw new ApiError(409, "ALREADY_REGISTERED", "You are already registered for this workshop");
    }

    const confirmedCount = await tx.registration.count({
      where: { workshopId, status: { in: ["CONFIRMED", "PENDING_PAYMENT"] } },
    });
    const decision = decideRegistration({
      workshopStatus: workshop.status,
      deadline: workshop.registrationDeadline!,
      now: new Date(),
      confirmedCount,
      capacity: workshop.capacity!,
      waitlistEnabled: workshop.waitlistEnabled,
      priceCents: workshop.priceCents ?? 0,
    });
    if (!decision.ok) {
      const messages = {
        NOT_PUBLISHED: "This workshop is not open for registration",
        DEADLINE_PASSED: "The registration deadline has passed",
        CAPACITY_REACHED: "This workshop is full",
      };
      throw new ApiError(409, decision.reason, messages[decision.reason]);
    }

    const saved = existing
      ? await tx.registration.update({
          where: { id: existing.id },
          data: { 
            status: decision.status,
            confirmedAt: decision.status === "CONFIRMED" ? new Date() : existing.confirmedAt,
            cancelledAt: null,
          },
        })
      : await tx.registration.create({
          data: { 
            workshopId, 
            userId, 
            status: decision.status,
            confirmedAt: decision.status === "CONFIRMED" ? new Date() : null,
          },
        });

    if (decision.status === "CONFIRMED") {
      await tx.order.upsert({
        where: { registrationId: saved.id },
        update: { status: "FREE", amountCents: 0, currency: workshop.currency },
        create: {
          userId,
          registrationId: saved.id,
          amountCents: 0,
          currency: workshop.currency,
          status: "FREE",
        },
      });
    }
    if (decision.status === "PENDING_PAYMENT") {
      await tx.order.upsert({
        where: { registrationId: saved.id },
        update: { status: "PENDING", amountCents: workshop.priceCents ?? 0, currency: workshop.currency },
        create: {
          userId,
          registrationId: saved.id,
          amountCents: workshop.priceCents ?? 0,
          currency: workshop.currency,
          status: "PENDING",
        },
      });
    }
    return { saved, workshopTitle: workshop.title, status: decision.status };
  });

  if (registration.status === "CONFIRMED") {
    await emitWorkshopDomainEvent({
      type: "REGISTRATION_CONFIRMED",
      userId,
      workshopId,
      workshopTitle: registration.workshopTitle,
    });
    
  }

  return prisma.registration.findUnique({
    where: { id: registration.saved.id },
    include: { workshop: true, order: true },
  });
}

export async function listMine(userId: string) {
  return prisma.registration.findMany({
    where: { userId },
    include: { workshop: true, order: { include: { payment: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRegistrationDetails(userId: string, registrationId: string, role: string) {
  const reg = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { workshop: true, order: { include: { payment: true } } },
  });
  if (!reg) throw new ApiError(404, "NOT_FOUND", "Registration not found");

  if (role === "PARTICIPANT" && reg.userId !== userId) {
    throw new ApiError(403, "FORBIDDEN", "You cannot view this registration");
  }
  if ((role === "ORGANIZER" || role === "ADMIN") && reg.userId !== userId && reg.workshop.organizerId !== userId && role !== "ADMIN") {
    throw new ApiError(403, "FORBIDDEN", "You cannot view this registration");
  }
  return reg;
}

export async function listForWorkshop(workshopId: string, userId: string, role: string) {
  if (role !== "ADMIN") {
    const workshop = await prisma.workshop.findUnique({ where: { id: workshopId } });
    if (!workshop) throw new ApiError(404, "NOT_FOUND", "Workshop not found");
    if (workshop.organizerId !== userId) {
      throw new ApiError(403, "FORBIDDEN", "You are not the organizer of this workshop");
    }
  }

  return prisma.registration.findMany({
    where: { workshopId },
    include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function cancelRegistration(userId: string, registrationId: string, isStaff: boolean) {
  const registration = await prisma.registration.findUnique({ where: { id: registrationId } });
  if (!registration) throw new ApiError(404, "NOT_FOUND", "Registration not found");
  if (!isStaff && registration.userId !== userId) {
    throw new ApiError(403, "FORBIDDEN", "You cannot cancel this registration");
  }
  return prisma.registration.update({
    where: { id: registrationId },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });
}
