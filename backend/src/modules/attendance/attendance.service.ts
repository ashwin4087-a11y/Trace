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
  const attended = total
    ? await prisma.attendance.count({
        where: {
          userId,
          status: "PRESENT",
          sessionId: { in: sessions.map((session) => session.id) },
        },
      })
    : 0;
  return {
    attended,
    total,
    percentage: calculateAttendancePercentage(attended, total),
  };
}

async function assertConfirmed(userId: string, workshopId: string) {
  const registration = await prisma.registration.findUnique({
    where: { workshopId_userId: { workshopId, userId } },
  });
  if (!registration || registration.status !== "CONFIRMED") {
    throw new ApiError(403, "NOT_REGISTERED", "Only confirmed participants can be marked present");
  }
}

export async function markManual(
  actor: AuthUser,
  input: { sessionId: string; userId: string; status: "PRESENT" | "ABSENT" | "EXCUSED"; note?: string },
) {
  const session = await prisma.workshopSession.findUnique({ where: { id: input.sessionId } });
  if (!session) throw new ApiError(404, "NOT_FOUND", "Session not found");
  await assertCanManageWorkshop(actor, session.workshopId);
  if (input.status === "PRESENT") await assertConfirmed(input.userId, session.workshopId);
  return prisma.attendance.upsert({
    where: { sessionId_userId: { sessionId: input.sessionId, userId: input.userId } },
    update: { status: input.status, method: "MANUAL", note: input.note, recordedById: actor.id },
    create: {
      sessionId: input.sessionId,
      userId: input.userId,
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
  await assertConfirmed(userId, session.workshopId);
  return prisma.attendance.upsert({
    where: { sessionId_userId: { sessionId: session.id, userId } },
    update: { status: "PRESENT", method: "QR", recordedAt: new Date() },
    create: { sessionId: session.id, userId, status: "PRESENT", method: "QR" },
  });
}

export async function historyForWorkshop(workshopId: string) {
  return prisma.attendance.findMany({
    where: { session: { workshopId } },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      session: { select: { id: true, title: true, startTime: true } },
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
