import crypto from "node:crypto";
import { prisma } from "../../config/database";
import { ApiError } from "../../shared/errors/api-error";
import type { AuthUser } from "../../shared/types/http";
import { sha256 } from "../../shared/utils/tokens";

import { emitWorkshopDomainEvent } from "../workshops/workshop.events";

export async function generateMyQr(user: AuthUser, sessionId: string) {
  const session = await prisma.workshopSession.findUnique({
    where: { id: sessionId },
    include: { workshop: true }
  });
  if (!session) throw new ApiError(404, "NOT_FOUND", "Session not found");

  const registration = await prisma.registration.findUnique({
    where: { workshopId_userId: { workshopId: session.workshopId, userId: user.id } }
  });

  if (!registration || registration.status !== "CONFIRMED") {
    throw new ApiError(403, "FORBIDDEN", "Your registration is not confirmed");
  }

  if (session.status !== "LIVE") {
    throw new ApiError(403, "FORBIDDEN", "Attendance has not started yet.");
  }

  // Invalidate any existing unused tokens for this session/user
  await prisma.personalQrToken.deleteMany({
    where: { sessionId, userId: user.id, consumedAt: null }
  });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 1000); // 30 seconds

  await prisma.personalQrToken.create({
    data: {
      tokenHash: sha256(rawToken),
      sessionId,
      registrationId: registration.id,
      userId: user.id,
      expiresAt,
    }
  });

  return {
    sessionId,
    expiresAt: expiresAt.toISOString(),
    expiresIn: 30,
    qrPayload: rawToken
  };
}

export async function verifyMyQr(user: AuthUser, input: { sessionId: string; token: string }) {
  const session = await prisma.workshopSession.findUnique({ where: { id: input.sessionId } });
  if (!session) throw new ApiError(404, "NOT_FOUND", "Session not found");
  if (session.status !== "LIVE") throw new ApiError(403, "FORBIDDEN", "Attendance has not been started.");

  const registration = await prisma.registration.findUnique({
    where: { workshopId_userId: { workshopId: session.workshopId, userId: user.id } }
  });
  if (!registration || registration.status !== "CONFIRMED") {
    throw new ApiError(403, "FORBIDDEN", "Registration is not confirmed.");
  }

  const tokenHash = sha256(input.token);
  let isValidMasterToken = false;

  if (session.qrTokenHash === tokenHash) {
    isValidMasterToken = true;
  } else {
    // Fallback to personal token check
    const qrToken = await prisma.personalQrToken.findUnique({ where: { tokenHash } });
    if (!qrToken) throw new ApiError(404, "NOT_FOUND", "Invalid QR code.");
    if (qrToken.userId !== user.id) throw new ApiError(403, "FORBIDDEN", "QR code belongs to another participant.");
    if (qrToken.sessionId !== input.sessionId) throw new ApiError(400, "BAD_REQUEST", "QR code is for a different session.");
    if (qrToken.registrationId !== registration.id) throw new ApiError(403, "FORBIDDEN", "Registration mismatch.");
    if (qrToken.consumedAt) throw new ApiError(403, "FORBIDDEN", "This QR code has already been used.");
    if (new Date() > qrToken.expiresAt) throw new ApiError(410, "GONE", "QR code expired. Please generate a new QR.");

    // Mark token consumed
    await prisma.personalQrToken.update({
      where: { id: qrToken.id },
      data: { consumedAt: new Date() }
    });
  }

  // Upsert Attendance
  const attendance = await prisma.attendance.upsert({
    where: { sessionId_registrationId: { sessionId: input.sessionId, registrationId: registration.id } },
    create: {
      sessionId: input.sessionId,
      registrationId: registration.id,
      userId: user.id,
      status: "PRESENT",
      method: "QR",
    },
    update: {
      status: "PRESENT",
      method: "QR",
      recordedAt: new Date(),
    }
  });

  // Create or resume Monitoring Session
  const monitoring = await prisma.attendanceMonitoringSession.upsert({
    where: { attendanceId: attendance.id },
    create: {
      attendanceId: attendance.id,
      sessionId: input.sessionId,
      registrationId: registration.id,
      userId: user.id,
      status: "ACTIVE",
    },
    update: {
      status: "ACTIVE",
      lastVerifiedAt: new Date(),
    }
  });

  emitWorkshopDomainEvent({
    type: "ATTENDANCE_VERIFIED",
    attendanceId: attendance.id,
    sessionId: input.sessionId,
    registrationId: registration.id,
    userId: user.id,
    method: "QR",
    verifiedAt: attendance.recordedAt || new Date()
  });

  return { 
    success: true,
    attendance: {
      status: "PRESENT",
      method: "QR",
      verifiedAt: attendance.recordedAt
    },
    meetingAccess: {
      status: "UNLOCKED"
    },
    monitoringSession: {
      id: monitoring.id,
      status: monitoring.status
    }
  };
}

export async function heartbeat(user: AuthUser, monitoringId: string) {
  const monitoring = await prisma.attendanceMonitoringSession.findUnique({
    where: { id: monitoringId },
    include: { session: true }
  });
  
  if (!monitoring || monitoring.userId !== user.id) {
    throw new ApiError(404, "NOT_FOUND", "Monitoring session not found");
  }

  if (monitoring.status !== "ACTIVE" || monitoring.session.status !== "LIVE") {
    throw new ApiError(400, "BAD_REQUEST", "Monitoring session is not active");
  }

  return prisma.attendanceMonitoringSession.update({
    where: { id: monitoringId },
    data: { lastVerifiedAt: new Date() }
  });
}

export async function fullscreenViolation(user: AuthUser, monitoringId: string) {
  const monitoring = await prisma.attendanceMonitoringSession.findUnique({
    where: { id: monitoringId },
    include: { session: true }
  });

  if (!monitoring || monitoring.userId !== user.id) {
    throw new ApiError(404, "NOT_FOUND", "Monitoring session not found");
  }

  if (monitoring.status !== "ACTIVE") {
    throw new ApiError(400, "BAD_REQUEST", "Monitoring session is not active");
  }

  const newWarningCount = monitoring.warningCount + 1;
  const isTerminated = newWarningCount >= 4;

  return prisma.attendanceMonitoringSession.update({
    where: { id: monitoringId },
    data: {
      warningCount: newWarningCount,
      status: isTerminated ? "TERMINATED" : "ACTIVE",
      terminationReason: isTerminated ? "FULLSCREEN_VIOLATION" : null,
      endedAt: isTerminated ? new Date() : null,
    }
  });
}

export async function endMonitoring(user: AuthUser, monitoringId: string) {
  const monitoring = await prisma.attendanceMonitoringSession.findUnique({
    where: { id: monitoringId }
  });

  if (!monitoring || monitoring.userId !== user.id) {
    throw new ApiError(404, "NOT_FOUND", "Monitoring session not found");
  }

  return prisma.attendanceMonitoringSession.update({
    where: { id: monitoringId },
    data: {
      status: "COMPLETED",
      terminationReason: "USER_EXITED",
      endedAt: new Date(),
    }
  });
}
