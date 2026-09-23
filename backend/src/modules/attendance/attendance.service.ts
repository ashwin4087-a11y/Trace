import { prisma } from "../../config/database";
import { ApiError } from "../../shared/errors/api-error";
import type { AuthUser } from "../../shared/types/http";
import { calculateAttendancePercentage } from "../../shared/utils/attendance";
import { sha256, randomToken } from "../../shared/utils/tokens";
import jwt from "jsonwebtoken";
import { recordAudit } from "../audit/audit.service";
import { emitWorkshopDomainEvent } from "../workshops/workshop.events";
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

  // AUREX 2026: Duration calculation
  let totalPercentageAccumulated = 0;
  
  for (const session of sessions) {
    const record = records.find(r => r.sessionId === session.id);
    if (!record || record.status !== "PRESENT") continue;

    // Check if it was an online monitored session
    const monitoring = await prisma.attendanceMonitoringSession.findFirst({
      where: { sessionId: session.id, userId, status: "COMPLETED" },
      orderBy: { createdAt: "desc" }
    });

    if (monitoring && monitoring.endedAt) {
      // Calculate duration percentage
      const durationMs = monitoring.endedAt.getTime() - monitoring.createdAt.getTime();
      const expectedDurationMs = 60 * 60 * 1000; // Assume 1 hour for AUREX if not specified
      let pct = (durationMs / expectedDurationMs) * 100;
      if (pct > 100) pct = 100;
      totalPercentageAccumulated += pct;
    } else {
      totalPercentageAccumulated += 100; // Offline or legacy attendance gets 100%
    }
  }

  const attended = records.filter(r => r.status === "PRESENT").length;
  const absent = records.filter(r => r.status === "ABSENT").length;
  const overallPercentage = total === 0 ? 0 : totalPercentageAccumulated / total;

  return {
    attended,
    absent,
    total,
    percentage: overallPercentage,
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
  input: { status: "PRESENT" | "ABSENT" | "EXCUSED"; reason: string },
) {
  if (!input.reason || input.reason.trim() === "") {
    throw new ApiError(400, "BAD_REQUEST", "Correction reason is required");
  }
  const existing = await prisma.attendance.findUnique({
    where: { id: attendanceId },
    include: { session: true },
  });
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Attendance record not found");
  await assertCanManageWorkshop(actor, existing.session.workshopId);
  const updated = await prisma.attendance.update({
    where: { id: attendanceId },
    data: { status: input.status, method: "CORRECTION", note: input.reason, recordedById: actor.id },
  });
  await recordAudit(actor.id, "MODIFY_ATTENDANCE", "Attendance", attendanceId, {
    from: existing.status,
    to: input.status,
    reason: input.reason
  });
  
  await emitWorkshopDomainEvent({
    type: "ATTENDANCE_UPDATED",
    attendanceId: updated.id,
    sessionId: updated.sessionId,
    workshopId: existing.session.workshopId,
    registrationId: updated.registrationId,
    userId: updated.userId,
    status: updated.status,
    updatedAt: updated.recordedAt,
    source: updated.method,
  });
  
  return updated;
}

export async function generateQr(actor: AuthUser, sessionId: string) {
  const session = await prisma.workshopSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new ApiError(404, "NOT_FOUND", "Session not found");
  await assertCanManageWorkshop(actor, session.workshopId);

  const jti = randomToken(32);
  const qrTokenHash = sha256(jti);

  await prisma.workshopSession.update({
    where: { id: sessionId },
    data: { qrTokenHash },
  });

  const secret = process.env.JWT_SECRET || "fallback";
  const token = jwt.sign({ sessionId, jti }, secret, { expiresIn: "5m" });

  return { token, expiresAt: new Date(Date.now() + 5 * 60 * 1000) };
}

export async function closeQr(actor: AuthUser, sessionId: string) {
  const session = await prisma.workshopSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new ApiError(404, "NOT_FOUND", "Session not found");
  await assertCanManageWorkshop(actor, session.workshopId);

  await prisma.workshopSession.update({
    where: { id: sessionId },
    data: { qrTokenHash: null },
  });
  return { success: true };
}

export async function checkInWithQr(userId: string, token: string) {
  const secret = process.env.JWT_SECRET || "fallback";
  let payload: any;
  try {
    payload = jwt.verify(token, secret);
  } catch (err) {
    throw new ApiError(400, "INVALID_QR", "QR code is expired or invalid");
  }

  const { sessionId, jti } = payload;
  const session = await prisma.workshopSession.findUnique({ where: { id: sessionId } });
  if (!session || !session.qrTokenHash || session.qrTokenHash !== sha256(jti)) {
    throw new ApiError(400, "INVALID_QR", "Attendance code is not valid or has been refreshed");
  }

  const registration = await prisma.registration.findUnique({
    where: { workshopId_userId: { workshopId: session.workshopId, userId } },
  });
  if (!registration || registration.status !== "CONFIRMED") {
    throw new ApiError(403, "NOT_REGISTERED", "Only confirmed participants can use QR check-in");
  }
  
  const attendance = await prisma.attendance.upsert({
    where: { sessionId_registrationId: { sessionId: session.id, registrationId: registration.id } },
    update: { status: "PRESENT", method: "QR", recordedAt: new Date() },
    create: { sessionId: session.id, registrationId: registration.id, userId, status: "PRESENT", method: "QR" },
  });

  await emitWorkshopDomainEvent({
    type: "ATTENDANCE_UPDATED",
    attendanceId: attendance.id,
    sessionId: session.id,
    workshopId: session.workshopId,
    registrationId: registration.id,
    userId,
    status: attendance.status,
    updatedAt: attendance.recordedAt,
    source: attendance.method,
  });

  return attendance;
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
