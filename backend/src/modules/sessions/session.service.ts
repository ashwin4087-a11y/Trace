import { prisma } from "../../config/database";
import type { Prisma } from "@prisma/client";
import { normalizeMeetingUrl } from "../../integrations/meetings/meeting.provider";
import { ApiError } from "../../shared/errors/api-error";
import type { AuthUser } from "../../shared/types/http";
import { canSeeMeetingLinks } from "../../shared/utils/meeting-access";
import { randomToken, sha256 } from "../../shared/utils/tokens";
import { assertCanManageWorkshop } from "../workshops/workshop.service";
import { finalizedDurationSeconds, finalizedPercentage } from "../attendance/attendance-timing";

export async function listSessions(user: AuthUser | undefined, workshopId: string) {
  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
    select: { organizerId: true },
  });
  if (!workshop) throw new ApiError(404, "NOT_FOUND", "Workshop not found");
  
  const sessions = await prisma.workshopSession.findMany({
    where: { workshopId },
    orderBy: { startTime: "asc" },
    include: { trainer: { select: { id: true, firstName: true, lastName: true } } },
  });
  
  const registration = user
    ? await prisma.registration.findUnique({
        where: { workshopId_userId: { workshopId, userId: user.id } },
        select: { status: true },
      })
    : null;
    
  if (
    user && 
    (user.role === "ADMIN" || (user.role === "ORGANIZER" && workshop.organizerId === user.id))
  ) {
    return sessions;
  }
  
  // For participants and public, hide meetingUrl and recordingUrl.
  // They must use /access endpoint for protected info.
  return sessions.map((session) => ({ 
    ...session, 
    meetingUrl: null,
    recordingUrl: null,
    jitsiRoomName: null,
  }));
}

export async function getSessionAccess(user: AuthUser, sessionId: string) {
  const session = await prisma.workshopSession.findUnique({
    where: { id: sessionId },
    include: { workshop: { select: { organizerId: true } } }
  });
  if (!session) throw new ApiError(404, "NOT_FOUND", "Session not found");
  
  const registration = await prisma.registration.findUnique({
    where: { workshopId_userId: { workshopId: session.workshopId, userId: user.id } },
    select: { status: true, id: true }
  });
  
  const isOrganizerOrAdmin = user.role === "ADMIN" || (user.role === "ORGANIZER" && session.workshop.organizerId === user.id);

  if (!isOrganizerOrAdmin) {
    if (registration?.status !== "CONFIRMED") {
      throw new ApiError(403, "FORBIDDEN", "Only confirmed participants can access this session");
    }

    if (session.status === "COMPLETED" || session.status === "CANCELLED") {
      return { access: "LOCKED", reason: "SESSION_ENDED" };
    }

    if (!session.meetingLive) {
      return { access: "LOCKED", reason: "MEETING_NOT_LIVE" };
    }

    // Check QR attendance monitoring session
    const monitoring = await prisma.attendanceMonitoringSession.findFirst({
      where: { sessionId, userId: user.id, status: "ACTIVE" }
    });

    if (!monitoring) {
      return { access: "LOCKED", reason: "ATTENDANCE_VERIFICATION_REQUIRED" };
    }
  }

  let jitsiRoomName = session.jitsiRoomName;
  if (!jitsiRoomName) {
    const updated = await prisma.workshopSession.update({
      where: { id: session.id },
      data: { jitsiRoomName: `trace-${randomToken(18)}` },
      select: { jitsiRoomName: true },
    });
    jitsiRoomName = updated.jitsiRoomName;
  }

  let monitoringSessionObj = undefined;
  if (user.role === "PARTICIPANT" && session.mode !== "OFFLINE" && session.status !== "COMPLETED") {
    const monitoring = await prisma.attendanceMonitoringSession.findFirst({
      where: { sessionId, userId: user.id, status: "ACTIVE" }
    });
    monitoringSessionObj = monitoring || undefined;
  }

  return {
    access: "GRANTED",
    id: session.id,
    title: session.title,
    startTime: session.startTime,
    endTime: session.endTime,
    mode: session.mode,
    meetingProvider: session.meetingProvider,
    meetingUrl: null,
    jitsiRoomName,
    meetingLive: session.meetingLive,
    recordingUrl: session.status === "COMPLETED" ? session.recordingUrl : null,
    status: session.status,
    workshopId: session.workshopId,
    monitoringSession: monitoringSessionObj,
  };
}

/** Organizer: release the meeting link to checked-in participants */
export async function makeMeetingLive(user: AuthUser, sessionId: string) {
  const session = await prisma.workshopSession.findUnique({
    where: { id: sessionId },
    include: { workshop: { select: { organizerId: true } } }
  });
  if (!session) throw new ApiError(404, "NOT_FOUND", "Session not found");
  // Must be ORGANIZER who owns this workshop, or ADMIN
  if (user.role !== "ADMIN") {
    if (user.role !== "ORGANIZER" || session.workshop.organizerId !== user.id) {
      throw new ApiError(403, "FORBIDDEN", "You are not authorized to manage this session");
    }
  }
  if (session.status !== "LIVE") {
    throw new ApiError(400, "INVALID_STATE", "Session must be LIVE before making the meeting live");
  }
  return prisma.workshopSession.update({
    where: { id: sessionId },
    data: {
      meetingLive: true,
      jitsiRoomName: session.jitsiRoomName ?? `trace-${randomToken(18)}`,
    },
    select: { id: true, meetingLive: true, jitsiRoomName: true }
  });
}

async function finalizeSessionAttendance(
  tx: Prisma.TransactionClient,
  sessionId: string,
  sessionDurationSeconds: number,
  threshold: number,
  now: Date,
) {
  const activeMonitoring = await tx.attendanceMonitoringSession.findMany({
    where: { sessionId, status: "ACTIVE" },
  });

  for (const monitoring of activeMonitoring) {
    await tx.attendanceMonitoringSession.update({
      where: { id: monitoring.id },
      data: { status: "COMPLETED", endedAt: now, terminationReason: "SESSION_ENDED" },
    });
  }

  const attendanceRecords = await tx.attendance.findMany({
    where: { sessionId, status: "PRESENT" },
    include: {
      attendanceMonitoringSession: { select: { endedAt: true } },
      registration: { select: { id: true } },
    },
  });

  for (const attendance of attendanceRecords) {
    const calculatedDuration = finalizedDurationSeconds(attendance.joinedAt, now, sessionDurationSeconds);
    const presentSeconds = attendance.durationSeconds ?? calculatedDuration ?? 0;
    const percentage = finalizedPercentage(attendance.joinedAt ? presentSeconds : null, sessionDurationSeconds);
    const eligible = Boolean(attendance.joinedAt) && percentage >= threshold;

    if (!attendance.finalizedAt) {
      await tx.attendance.update({
        where: { id: attendance.id },
        data: { finalizedAt: now, durationSeconds: presentSeconds },
      });
    }

    await tx.attendanceComputation.upsert({
      where: { registrationId_workshopSessionId: {
        registrationId: attendance.registrationId,
        workshopSessionId: sessionId,
      } },
      create: {
        registrationId: attendance.registrationId,
        workshopSessionId: sessionId,
        presentSeconds,
        awaySeconds: Math.max(0, sessionDurationSeconds - presentSeconds),
        scheduledSeconds: sessionDurationSeconds,
        percentage,
        status: eligible ? "COMPLETED" : "ABSENT",
        certificateEligible: eligible,
        policyVersion: "v2-jitsi-first-join",
      },
      update: {
        presentSeconds,
        awaySeconds: Math.max(0, sessionDurationSeconds - presentSeconds),
        scheduledSeconds: sessionDurationSeconds,
        percentage,
        status: eligible ? "COMPLETED" : "ABSENT",
        certificateEligible: eligible,
        policyVersion: "v2-jitsi-first-join",
        computedAt: now,
      },
    });
  }
}

/** Organizer: revoke meeting link access (e.g. break period) */
export async function endMeeting(user: AuthUser, sessionId: string) {
  const session = await prisma.workshopSession.findUnique({
    where: { id: sessionId },
    include: { workshop: { select: { organizerId: true, attendanceThresholdPercent: true } } }
  });
  if (!session) throw new ApiError(404, "NOT_FOUND", "Session not found");
  if (user.role !== "ADMIN") {
    if (user.role !== "ORGANIZER" || session.workshop.organizerId !== user.id) {
      throw new ApiError(403, "FORBIDDEN", "You are not authorized to manage this session");
    }
  }
  if (!session.meetingLive) {
    return { id: session.id, meetingLive: false };
  }

  const sessionDurationSeconds = Math.max(0, Math.round(
    (session.endTime.getTime() - session.startTime.getTime()) / 1000,
  ));
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.workshopSession.update({
      where: { id: sessionId },
      data: { status: "COMPLETED", meetingLive: false },
    });
    await finalizeSessionAttendance(
      tx,
      sessionId,
      sessionDurationSeconds,
      session.workshop.attendanceThresholdPercent,
      now,
    );
  });

  return { id: session.id, meetingLive: false };
}

/** Organizer: end session — transactionally complete, finalize attendance, compute eligibility */
export async function endSession(user: AuthUser, sessionId: string) {
  const session = await prisma.workshopSession.findUnique({
    where: { id: sessionId },
    include: { workshop: { select: { organizerId: true, attendanceThresholdPercent: true } } }
  });
  if (!session) throw new ApiError(404, "NOT_FOUND", "Session not found");
  if (user.role !== "ADMIN") {
    if (user.role !== "ORGANIZER" || session.workshop.organizerId !== user.id) {
      throw new ApiError(403, "FORBIDDEN", "You are not authorized to manage this session");
    }
  }
  if (session.status === "COMPLETED") {
    return { success: true, sessionId, status: "COMPLETED" };
  }

  const threshold = session.workshop.attendanceThresholdPercent;
  const sessionDurationSeconds = Math.round(
    (session.endTime.getTime() - session.startTime.getTime()) / 1000
  );
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    // 1. Complete the session, disable meeting
    await tx.workshopSession.update({
      where: { id: sessionId },
      data: { status: "COMPLETED", meetingLive: false }
    });

    await finalizeSessionAttendance(tx, sessionId, sessionDurationSeconds, threshold, now);
  });

  return { success: true, sessionId, status: "COMPLETED" };
}

async function validateSessionOverlap(workshopId: string, startTime: Date, endTime: Date, ignoreSessionId?: string) {
  const overlapping = await prisma.workshopSession.findFirst({
    where: {
      workshopId,
      id: ignoreSessionId ? { not: ignoreSessionId } : undefined,
      status: { in: ["SCHEDULED", "LIVE"] },
      OR: [
        { startTime: { lt: endTime }, endTime: { gt: startTime } }
      ]
    }
  });
  if (overlapping) {
    throw new ApiError(409, "SESSION_OVERLAP", "Session overlaps with an existing session in this workshop");
  }
}

export async function createSession(
  user: AuthUser,
  input: {
    workshopId: string;
    title: string;
    description?: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    mode: "ONLINE" | "OFFLINE" | "HYBRID";
    meetingProvider?: string;
    trainerId?: string;
    trainerName?: string;
    meetingUrl?: string;
    venue?: string;
  },
) {
  await assertCanManageWorkshop(user, input.workshopId);
  
  const st = new Date(input.startTime);
  const et = new Date(input.endTime);
  if (et <= st) {
    throw new ApiError(400, "INVALID_TIMES", "End time must be after start time");
  }
  
  await validateSessionOverlap(input.workshopId, st, et);
  
  const count = await prisma.workshopSession.count({ where: { workshopId: input.workshopId } });
  const sessionNumber = count + 1;
  const isVirtual = input.mode === "ONLINE" || input.mode === "HYBRID";
  
  return prisma.workshopSession.create({
    data: {
      workshopId: input.workshopId,
      sessionNumber,
      title: input.title,
      sessionDate: new Date(input.sessionDate),
      startTime: st,
      endTime: et,
      mode: input.mode,
      meetingProvider: isVirtual ? "JITSI" : undefined,
      trainerId: input.trainerId,
      trainerName: input.trainerName,
      meetingUrl: null,
      jitsiRoomName: isVirtual ? `trace-${randomToken(18)}` : null,
      venue: input.venue,
    },
  });
}

export async function updateSession(
  user: AuthUser,
  id: string,
  input: Partial<{
    title: string;
    description: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    mode: "ONLINE" | "OFFLINE" | "HYBRID";
    meetingProvider: string;
    trainerName: string;
    meetingUrl: string | null;
    recordingUrl: string | null;
    venue: string | null;
    status: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";
  }>,
) {
  const session = await prisma.workshopSession.findUnique({ where: { id } });
  if (!session) throw new ApiError(404, "NOT_FOUND", "Session not found");
  await assertCanManageWorkshop(user, session.workshopId);
  
  let st = session.startTime;
  let et = session.endTime;
  
  if (input.startTime || input.endTime) {
    st = input.startTime ? new Date(input.startTime) : st;
    et = input.endTime ? new Date(input.endTime) : et;
    if (et <= st) {
      throw new ApiError(400, "INVALID_TIMES", "End time must be after start time");
    }
    await validateSessionOverlap(session.workshopId, st, et, id);
  }

  // Validate status transitions loosely based on typical flow
  if (input.status) {
    if (session.status === "COMPLETED" && input.status === "SCHEDULED") {
      throw new ApiError(400, "INVALID_STATUS_TRANSITION", "Cannot transition from COMPLETED to SCHEDULED");
    }
    if (session.status === "CANCELLED" && input.status !== "CANCELLED") {
      throw new ApiError(400, "INVALID_STATUS_TRANSITION", "Cannot transition out of CANCELLED status");
    }
  }
  
  let meetingUrl = input.meetingUrl !== undefined ? input.meetingUrl : session.meetingUrl;
  if (meetingUrl && input.meetingUrl) {
    try {
      meetingUrl = normalizeMeetingUrl(meetingUrl).url;
    } catch (error) {
      throw new ApiError(400, "INVALID_MEETING_URL", error instanceof Error ? error.message : "Invalid URL");
    }
  }

  return prisma.workshopSession.update({
    where: { id },
    data: {
      title: input.title,
      sessionDate: input.sessionDate ? new Date(input.sessionDate) : undefined,
      startTime: input.startTime ? new Date(input.startTime) : undefined,
      endTime: input.endTime ? new Date(input.endTime) : undefined,
      mode: input.mode,
      meetingProvider: input.meetingProvider,
      trainerName: input.trainerName,
      meetingUrl,
      recordingUrl: input.recordingUrl,
      venue: input.venue,
      status: input.status,
    },
  });
}

export async function deleteSession(user: AuthUser, id: string) {
  const session = await prisma.workshopSession.findUnique({ where: { id } });
  if (!session) throw new ApiError(404, "NOT_FOUND", "Session not found");
  await assertCanManageWorkshop(user, session.workshopId);
  
  const attendanceCount = await prisma.attendance.count({ where: { sessionId: id } });
  if (attendanceCount > 0) {
    throw new ApiError(409, "CANNOT_DELETE", "Cannot delete a session that already has attendance records. Cancel it instead.");
  }
  
  return prisma.workshopSession.delete({
    where: { id },
  });
}

export async function issueQrToken(user: AuthUser, sessionId: string) {
  const session = await prisma.workshopSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new ApiError(404, "NOT_FOUND", "Session not found");
  await assertCanManageWorkshop(user, session.workshopId);
  const token = randomToken();
  await prisma.workshopSession.update({
    where: { id: sessionId },
    data: { qrTokenHash: sha256(token) },
  });
  return { token, sessionId };
}
