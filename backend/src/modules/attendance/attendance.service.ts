import { prisma } from "../../config/database";
import { ApiError } from "../../shared/errors/api-error";
import type { AuthUser } from "../../shared/types/http";
import { calculateAttendancePercentage } from "../../shared/utils/attendance";
import { sha256 } from "../../shared/utils/tokens";
import { recordAudit } from "../audit/audit.service";
import { assertCanManageWorkshop } from "../workshops/workshop.service";

export async function summarize(userId: string, workshopId: string) {
  const sessions = await prisma.workshopSession.findMany({
    where: { workshopId, status: { not: "CANCELLED" } },
    select: { id: true },
  });
  const total = sessions.length;
  
  const records = await prisma.attendance.findMany({
    where: {
      userId,
      sessionId: { in: sessions.map((s) => s.id) },
    },
    include: { session: true },
  });

  const attended = records.filter(r => r.status === "PRESENT").length;
  const absent = records.filter(r => r.status === "ABSENT").length;

  return {
    attended,
    absent,
    total,
    percentage: calculateAttendancePercentage(attended, total),
    records,
  };
}

async function assertConfirmedRegistration(registrationId: string, expectedWorkshopId: string) {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
  });
  if (!registration || registration.workshopId !== expectedWorkshopId) {
    throw new ApiError(400, "INVALID_REGISTRATION", "Registration is invalid for this session");
  }
  if (registration.status !== "CONFIRMED") {
    throw new ApiError(403, "NOT_REGISTERED", "Only confirmed participants can have attendance marked");
  }
  return registration;
}

export async function sessionAttendance(actor: AuthUser, sessionId: string) {
  const session = await prisma.workshopSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new ApiError(404, "NOT_FOUND", "Session not found");
  await assertCanManageWorkshop(actor, session.workshopId);

  return prisma.attendance.findMany({
    where: { sessionId },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      registration: { select: { id: true, status: true } },
    },
    orderBy: { user: { firstName: "asc" } },
  });
}

export async function initialize(actor: AuthUser, sessionId: string) {
  const session = await prisma.workshopSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new ApiError(404, "NOT_FOUND", "Session not found");
  await assertCanManageWorkshop(actor, session.workshopId);

  const confirmedRegistrations = await prisma.registration.findMany({
    where: { workshopId: session.workshopId, status: "CONFIRMED" },
  });

  if (confirmedRegistrations.length === 0) return { count: 0 };

  const existingAttendance = await prisma.attendance.findMany({
    where: { sessionId },
    select: { registrationId: true },
  });

  const existingRegistrationIds = new Set(existingAttendance.map((a) => a.registrationId));
  const newRegistrations = confirmedRegistrations.filter((r) => !existingRegistrationIds.has(r.id));

  if (newRegistrations.length === 0) return { count: 0 };

  const created = await prisma.attendance.createMany({
    data: newRegistrations.map((r) => ({
      sessionId,
      registrationId: r.id,
      userId: r.userId,
      status: "ABSENT",
      method: "MANUAL",
      recordedById: actor.id,
    })),
    skipDuplicates: true,
  });

  return { count: created.count };
}

export async function bulkMark(
  actor: AuthUser,
  sessionId: string,
  input: { registrationIds: string[]; status: "PRESENT" | "ABSENT" },
) {
  const session = await prisma.workshopSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new ApiError(404, "NOT_FOUND", "Session not found");
  await assertCanManageWorkshop(actor, session.workshopId);

  const result = await prisma.$transaction(async (tx) => {
    const registrations = await tx.registration.findMany({
      where: {
        id: { in: input.registrationIds },
        workshopId: session.workshopId,
        status: "CONFIRMED",
      },
    });

    const validRegistrationIds = new Set(registrations.map((r) => r.id));
    const invalidIds = input.registrationIds.filter((id) => !validRegistrationIds.has(id));
    if (invalidIds.length > 0) {
      throw new ApiError(400, "INVALID_REGISTRATION", `Invalid or unconfirmed registrations: ${invalidIds.join(", ")}`);
    }

    const updates = await Promise.all(
      registrations.map(async (reg) => {
        return tx.attendance.upsert({
          where: { sessionId_registrationId: { sessionId, registrationId: reg.id } },
          update: { status: input.status, method: "MANUAL", recordedById: actor.id },
          create: {
            sessionId,
            registrationId: reg.id,
            userId: reg.userId,
            status: input.status,
            method: "MANUAL",
            recordedById: actor.id,
          },
        });
      }),
    );
    return updates.length;
  });

  return { updated: result };
}

export async function markManual(
  actor: AuthUser,
  input: { sessionId: string; registrationId: string; status: "PRESENT" | "ABSENT" | "EXCUSED"; note?: string },
) {
  const session = await prisma.workshopSession.findUnique({ where: { id: input.sessionId } });
  if (!session) throw new ApiError(404, "NOT_FOUND", "Session not found");
  await assertCanManageWorkshop(actor, session.workshopId);
  const registration = await assertConfirmedRegistration(input.registrationId, session.workshopId);

  return prisma.attendance.upsert({
    where: { sessionId_registrationId: { sessionId: input.sessionId, registrationId: input.registrationId } },
    update: { status: input.status, method: "MANUAL", note: input.note, recordedById: actor.id },
    create: {
      sessionId: input.sessionId,
      registrationId: input.registrationId,
      userId: registration.userId,
      status: input.status,
      method: "MANUAL",
      note: input.note,
      recordedById: actor.id,
    },
  });
}

export async function correct(
  actor: AuthUser,
  attendanceId: string,
  input: { status: "PRESENT" | "ABSENT" | "EXCUSED"; note?: string },
) {
  const existing = await prisma.attendance.findUnique({
    where: { id: attendanceId },
    include: { session: true },
  });
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Attendance record not found");
  await assertCanManageWorkshop(actor, existing.session.workshopId);
  const updated = await prisma.attendance.update({
    where: { id: attendanceId },
    data: { status: input.status, method: "CORRECTION", note: input.note, recordedById: actor.id },
  });
  await recordAudit(actor.id, "MODIFY_ATTENDANCE", "Attendance", attendanceId, {
    from: existing.status,
    to: input.status,
  });
  return updated;
}

export async function checkInWithQr(userId: string, token: string) {
  const session = await prisma.workshopSession.findUnique({ where: { qrTokenHash: sha256(token) } });
  if (!session) throw new ApiError(400, "INVALID_QR", "Attendance code is not valid");
  const registration = await prisma.registration.findUnique({
    where: { workshopId_userId: { workshopId: session.workshopId, userId } },
  });
  if (!registration || registration.status !== "CONFIRMED") {
    throw new ApiError(403, "NOT_REGISTERED", "Only confirmed participants can use QR check-in");
  }
  return prisma.attendance.upsert({
    where: { sessionId_registrationId: { sessionId: session.id, registrationId: registration.id } },
    update: { status: "PRESENT", method: "QR", recordedAt: new Date() },
    create: { sessionId: session.id, registrationId: registration.id, userId, status: "PRESENT", method: "QR" },
  });
}

export async function historyForWorkshop(workshopId: string) {
  return prisma.attendance.findMany({
    where: { session: { workshopId } },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      session: { select: { id: true, title: true, startTime: true } },
      registration: { select: { id: true, status: true } },
    },
    orderBy: { recordedAt: "desc" },
  });
}

export async function myHistory(userId: string) {
  return prisma.attendance.findMany({
    where: { userId },
    include: { session: { include: { workshop: { select: { id: true, title: true } } } } },
    orderBy: { recordedAt: "desc" },
  });
}

export async function workshopSummary(actor: AuthUser, workshopId: string) {
  await assertCanManageWorkshop(actor, workshopId);

  const sessions = await prisma.workshopSession.findMany({
    where: { workshopId, status: { not: "CANCELLED" } },
    select: { id: true, title: true, startTime: true },
    orderBy: { startTime: "asc" },
  });

  const confirmedRegistrations = await prisma.registration.count({
    where: { workshopId, status: "CONFIRMED" },
  });

  const totalPossible = confirmedRegistrations * sessions.length;

  const presentCount = await prisma.attendance.count({
    where: {
      session: { workshopId },
      status: "PRESENT",
      registration: { status: "CONFIRMED" },
    },
  });

  const absentCount = await prisma.attendance.count({
    where: {
      session: { workshopId },
      status: "ABSENT",
      registration: { status: "CONFIRMED" },
    },
  });

  const sessionSummaries = await Promise.all(
    sessions.map(async (s) => {
      const p = await prisma.attendance.count({
        where: { sessionId: s.id, status: "PRESENT", registration: { status: "CONFIRMED" } },
      });
      const a = await prisma.attendance.count({
        where: { sessionId: s.id, status: "ABSENT", registration: { status: "CONFIRMED" } },
      });
      return {
        id: s.id,
        title: s.title,
        startTime: s.startTime,
        present: p,
        absent: a,
        percentage: calculateAttendancePercentage(p, confirmedRegistrations),
      };
    }),
  );

  return {
    overallPercentage: calculateAttendancePercentage(presentCount, totalPossible),
    totalParticipants: confirmedRegistrations,
    presentRecords: presentCount,
    absentRecords: absentCount,
    sessions: sessionSummaries,
  };
}
