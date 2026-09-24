import { prisma } from "../../config/database";
import { normalizeMeetingUrl } from "../../integrations/meetings/meeting.provider";
import { ApiError } from "../../shared/errors/api-error";
import type { AuthUser } from "../../shared/types/http";
import { canSeeMeetingLinks } from "../../shared/utils/meeting-access";
import { randomToken, sha256 } from "../../shared/utils/tokens";
import { assertCanManageWorkshop } from "../workshops/workshop.service";

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
    recordingUrl: null
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

    // Check QR attendance monitoring session
    const monitoring = await prisma.attendanceMonitoringSession.findFirst({
      where: { sessionId, userId: user.id, status: "ACTIVE" }
    });

    if (!monitoring) {
      return { access: "LOCKED", reason: "ATTENDANCE_VERIFICATION_REQUIRED" };
    }
  }

  // A configured meeting URL is released after the participant passes the attendance gate.
  const meetingUrl = session.meetingUrl;

  return {
    access: "GRANTED",
    id: session.id,
    title: session.title,
    startTime: session.startTime,
    endTime: session.endTime,
    mode: session.mode,
    meetingProvider: session.meetingProvider,
    meetingUrl,
    meetingLive: session.meetingLive,
    recordingUrl: session.status === "COMPLETED" ? session.recordingUrl : null,
    status: session.status,
    workshopId: session.workshopId
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
  if (!session.meetingUrl) {
    throw new ApiError(400, "NO_MEETING_URL", "No meeting URL configured for this session");
  }
  return prisma.workshopSession.update({
    where: { id: sessionId },
    data: { meetingLive: true },
    select: { id: true, meetingLive: true }
  });
}

/** Organizer: revoke meeting link access (e.g. break period) */
export async function endMeeting(user: AuthUser, sessionId: string) {
  const session = await prisma.workshopSession.findUnique({
    where: { id: sessionId },
    include: { workshop: { select: { organizerId: true } } }
  });
  if (!session) throw new ApiError(404, "NOT_FOUND", "Session not found");
  if (user.role !== "ADMIN") {
    if (user.role !== "ORGANIZER" || session.workshop.organizerId !== user.id) {
      throw new ApiError(403, "FORBIDDEN", "You are not authorized to manage this session");
    }
  }
  return prisma.workshopSession.update({
    where: { id: sessionId },
    data: { meetingLive: false },
    select: { id: true, meetingLive: true }
  });
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
    throw new ApiError(400, "ALREADY_COMPLETED", "Session is already completed");
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

    // 2. Close all active monitoring sessions and record endedAt
    const activeMonitoring = await tx.attendanceMonitoringSession.findMany({
      where: { sessionId, status: "ACTIVE" },
      include: { attendance: { select: { recordedAt: true, registrationId: true } } }
    });

    for (const mon of activeMonitoring) {
      await tx.attendanceMonitoringSession.update({
        where: { id: mon.id },
        data: { status: "COMPLETED", endedAt: now, terminationReason: "SESSION_ENDED" }
      });
    }

    // 3. Finalize attendance computation for every present participant
    const attendanceRecords = await tx.attendance.findMany({
      where: { sessionId, status: "PRESENT" },
      include: {
        attendanceMonitoringSession: { select: { endedAt: true } },
        registration: { select: { id: true } }
      }
    });

    for (const att of attendanceRecords) {
      const checkIn = att.recordedAt;
      const checkOut = att.attendanceMonitoringSession?.endedAt ?? now;
      const presentSeconds = Math.round((checkOut.getTime() - checkIn.getTime()) / 1000);
      const awaySeconds = Math.max(0, sessionDurationSeconds - presentSeconds);
      const percentage = sessionDurationSeconds > 0
        ? Math.min(100, Math.round((presentSeconds / sessionDurationSeconds) * 10000) / 100)
        : 0;
      const eligible = percentage >= threshold;

      await tx.attendanceComputation.upsert({
        where: { registrationId_workshopSessionId: {
          registrationId: att.registrationId,
          workshopSessionId: sessionId
        }},
        create: {
          registrationId: att.registrationId,
          workshopSessionId: sessionId,
          presentSeconds,
          awaySeconds,
          scheduledSeconds: sessionDurationSeconds,
          percentage,
          status: eligible ? "COMPLETED" : "INSUFFICIENT",
          certificateEligible: eligible,
          policyVersion: "v1"
        },
        update: {
          presentSeconds,
          awaySeconds,
          scheduledSeconds: sessionDurationSeconds,
          percentage,
          status: eligible ? "COMPLETED" : "INSUFFICIENT",
          certificateEligible: eligible,
          computedAt: now
        }
      });
    }
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
  
  let meetingUrl: string | null = null;
  if (input.meetingUrl) {
    try {
      meetingUrl = normalizeMeetingUrl(input.meetingUrl).url;
    } catch (error) {
      throw new ApiError(400, "INVALID_MEETING_URL", error instanceof Error ? error.message : "Invalid URL");
    }
  }
  
  const count = await prisma.workshopSession.count({ where: { workshopId: input.workshopId } });
  const sessionNumber = count + 1;
  
  return prisma.workshopSession.create({
    data: {
      workshopId: input.workshopId,
      sessionNumber,
      title: input.title,
      sessionDate: new Date(input.sessionDate),
      startTime: st,
      endTime: et,
      mode: input.mode,
      meetingProvider: input.meetingProvider,
      trainerId: input.trainerId,
      trainerName: input.trainerName,
      meetingUrl,
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
