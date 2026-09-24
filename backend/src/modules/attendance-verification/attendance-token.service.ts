import crypto from "node:crypto";
import { prisma } from "../../config/database";
import { env } from "../../config/environment";
import { ApiError } from "../../shared/errors/api-error";
import { sha256 } from "../../shared/utils/tokens";

const TOKEN_BYTES = 32;

function assertEnabled() {
  if (!env.attendance.enabled) {
    throw new ApiError(503, "ATTENDANCE_DISABLED", "Attendance verification is disabled");
  }
}

function tokenHashMatches(storedHash: string, rawToken: string) {
  const expected = Buffer.from(storedHash, "hex");
  const actual = Buffer.from(sha256(rawToken), "hex");
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function sessionWindow(session: { startTime: Date; endTime: Date }, workshop: { joinWindowMinutesBefore: number; endGraceMinutes: number }) {
  const validFrom = new Date(session.startTime.getTime() - workshop.joinWindowMinutesBefore * 60_000);
  const expiresAt = new Date(session.endTime.getTime() + workshop.endGraceMinutes * 60_000);
  return { validFrom, expiresAt };
}

export function validateWindow(
  now: Date,
  session: { startTime: Date; endTime: Date },
  workshop: { joinWindowMinutesBefore: number; endGraceMinutes: number },
) {
  const window = sessionWindow(session, workshop);
  return {
    ...window,
    isOpen: now >= window.validFrom && now <= window.expiresAt,
  };
}

export async function issueToken(registrationId: string, workshopSessionId: string) {
  assertEnabled();
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { workshop: true },
  });
  const session = await prisma.workshopSession.findUnique({
    where: { id: workshopSessionId },
    include: { workshop: true },
  });
  if (!registration || !session || registration.workshopId !== session.workshopId) {
    throw new ApiError(404, "ATTENDANCE_NOT_FOUND", "Attendance token could not be issued");
  }
  if (registration.status !== "CONFIRMED" || session.status === "CANCELLED") {
    throw new ApiError(403, "ATTENDANCE_NOT_ELIGIBLE", "Attendance token could not be issued");
  }

  const rawToken = crypto.randomBytes(TOKEN_BYTES).toString("base64url");
  const { validFrom, expiresAt } = sessionWindow(session, session.workshop);
  const token = await prisma.$transaction(async (tx) => {
    await tx.attendanceAccessToken.updateMany({
      where: { registrationId, workshopSessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return tx.attendanceAccessToken.create({
      data: {
        tokenHash: sha256(rawToken),
        registrationId,
        workshopSessionId,
        validFrom,
        expiresAt,
      },
    });
  });

  return { token: rawToken, accessToken: token, validFrom, expiresAt };
}

export async function redeemToken(rawToken: string, expectedWorkshopSessionId?: string) {
  assertEnabled();
  const candidateHash = sha256(rawToken);
  const token = await prisma.attendanceAccessToken.findUnique({
    where: { tokenHash: candidateHash },
    include: {
      registration: { include: { user: true, workshop: true } },
      workshopSession: { include: { workshop: true } },
    },
  });

  if (!token || !tokenHashMatches(token.tokenHash, rawToken)) {
    throw new ApiError(400, "ATTENDANCE_TOKEN_INVALID", "Attendance token is invalid or unavailable");
  }
  if (expectedWorkshopSessionId && token.workshopSessionId !== expectedWorkshopSessionId) {
    throw new ApiError(400, "ATTENDANCE_TOKEN_INVALID", "Attendance token is invalid or unavailable");
  }
  if (token.revokedAt || token.redeemedAt || token.registration.status !== "CONFIRMED" || token.workshopSession.status === "CANCELLED") {
    throw new ApiError(400, "ATTENDANCE_TOKEN_INVALID", "Attendance token is invalid or unavailable");
  }
  if (!validateWindow(new Date(), token.workshopSession, token.workshopSession.workshop).isOpen) {
    throw new ApiError(400, "ATTENDANCE_TOKEN_INVALID", "Attendance token is invalid or unavailable");
  }

  const redeemed = await prisma.attendanceAccessToken.update({
    where: { id: token.id },
    data: { redeemedAt: new Date() },
  });
  return {
    token: redeemed,
    registration: token.registration,
    workshopSession: token.workshopSession,
  };
}

export async function revokeToken(tokenId: string) {
  assertEnabled();
  return prisma.attendanceAccessToken.update({
    where: { id: tokenId },
    data: { revokedAt: new Date() },
  });
}

export async function reissueToken(registrationId: string, workshopSessionId: string) {
  assertEnabled();
  return issueToken(registrationId, workshopSessionId);
}
