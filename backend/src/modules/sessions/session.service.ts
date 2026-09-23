import { prisma } from "../../config/database";
import { normalizeMeetingUrl } from "../../integrations/meetings/meeting.provider";
import { ApiError } from "../../shared/errors/api-error";
import type { AuthUser } from "../../shared/types/http";
import { randomToken, sha256 } from "../../shared/utils/tokens";
import { assertCanManageWorkshop } from "../workshops/workshop.service";

export async function listSessions(workshopId: string) {
  return prisma.workshopSession.findMany({
    where: { workshopId },
    orderBy: { startTime: "asc" },
    include: { trainer: { select: { id: true, firstName: true, lastName: true } } },
  });
}

export async function createSession(
  user: AuthUser,
  input: {
    workshopId: string;
    title: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    trainerId?: string;
    trainerName?: string;
    meetingUrl?: string;
    venue?: string;
  },
) {
  await assertCanManageWorkshop(user, input.workshopId);
  let meetingUrl: string | null = null;
  if (input.meetingUrl) {
    try {
      meetingUrl = normalizeMeetingUrl(input.meetingUrl).url;
    } catch (error) {
      throw new ApiError(400, "INVALID_MEETING_URL", error instanceof Error ? error.message : "Invalid URL");
    }
  }
  return prisma.workshopSession.create({
    data: {
      workshopId: input.workshopId,
      title: input.title,
      sessionDate: new Date(input.sessionDate),
      startTime: new Date(input.startTime),
      endTime: new Date(input.endTime),
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
    sessionDate: string;
    startTime: string;
    endTime: string;
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
  return prisma.workshopSession.update({
    where: { id },
    data: {
      title: input.title,
      sessionDate: input.sessionDate ? new Date(input.sessionDate) : undefined,
      startTime: input.startTime ? new Date(input.startTime) : undefined,
      endTime: input.endTime ? new Date(input.endTime) : undefined,
      trainerName: input.trainerName,
      meetingUrl: input.meetingUrl,
      recordingUrl: input.recordingUrl,
      venue: input.venue,
      status: input.status,
    },
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
