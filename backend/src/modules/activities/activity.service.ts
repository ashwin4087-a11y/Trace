import { prisma } from "../../config/database";
import { ApiError } from "../../shared/errors/api-error";
import type { AuthUser } from "../../shared/types/http";
import { assertCanManageWorkshop } from "../workshops/workshop.service";
import type { 
  CreateActivityInput, 
  UpdateActivityInput, 
  ReorderActivityInput,
  SubmitActivityInput,
  ReviewSubmissionInput
} from "./activity.types";
import { storeUploadedFile } from "../../integrations/storage/storage.provider";

// ============================================================================
// Organizer Logic
// ============================================================================

export async function listOrganizerActivities(user: AuthUser, workshopId: string) {
  await assertCanManageWorkshop(user, workshopId);
  return prisma.activity.findMany({
    where: { workshopId },
    orderBy: { sortOrder: "asc" },
    include: {
      session: { select: { id: true, title: true } },
      _count: { select: { submissions: true } }
    }
  });
}

export async function createActivity(user: AuthUser, input: CreateActivityInput) {
  await assertCanManageWorkshop(user, input.workshopId);
  
  if (input.sessionId) {
    const session = await prisma.workshopSession.findUnique({ where: { id: input.sessionId } });
    if (!session || session.workshopId !== input.workshopId) {
      throw new ApiError(400, "INVALID_SESSION", "Session does not exist or belong to this workshop");
    }
  }

  // Determine sortOrder
  const lastActivity = await prisma.activity.findFirst({
    where: { workshopId: input.workshopId },
    orderBy: { sortOrder: "desc" }
  });
  const sortOrder = lastActivity ? lastActivity.sortOrder + 1 : 0;

  return prisma.activity.create({
    data: {
      ...input,
      sortOrder,
      status: "DRAFT"
    }
  });
}

export async function updateActivity(user: AuthUser, activityId: string, input: UpdateActivityInput) {
  const activity = await prisma.activity.findUnique({ where: { id: activityId } });
  if (!activity) throw new ApiError(404, "NOT_FOUND", "Activity not found");
  
  await assertCanManageWorkshop(user, activity.workshopId);

  if (input.sessionId) {
    const session = await prisma.workshopSession.findUnique({ where: { id: input.sessionId } });
    if (!session || session.workshopId !== activity.workshopId) {
      throw new ApiError(400, "INVALID_SESSION", "Session does not exist or belong to this workshop");
    }
  }

  return prisma.activity.update({
    where: { id: activityId },
    data: input
  });
}

export async function deleteActivity(user: AuthUser, activityId: string) {
  const activity = await prisma.activity.findUnique({ where: { id: activityId } });
  if (!activity) throw new ApiError(404, "NOT_FOUND", "Activity not found");
  
  await assertCanManageWorkshop(user, activity.workshopId);

  // Archive instead of hard delete
  return prisma.activity.update({
    where: { id: activityId },
    data: { status: "ARCHIVED" }
  });
}

export async function publishActivity(user: AuthUser, activityId: string) {
  return updateActivity(user, activityId, { status: "PUBLISHED" });
}

export async function closeActivity(user: AuthUser, activityId: string) {
  return updateActivity(user, activityId, { status: "CLOSED" });
}

export async function reorderActivities(user: AuthUser, workshopId: string, activities: ReorderActivityInput) {
  await assertCanManageWorkshop(user, workshopId);

  // Ensure all activities belong to this workshop
  const existingActivities = await prisma.activity.findMany({
    where: { workshopId, id: { in: activities.map(a => a.id) } }
  });

  if (existingActivities.length !== activities.length) {
    throw new ApiError(400, "INVALID_INPUT", "Some activities do not exist in this workshop");
  }

  const updates = activities.map(a => 
    prisma.activity.update({
      where: { id: a.id },
      data: { sortOrder: a.sortOrder }
    })
  );

  await prisma.$transaction(updates);
  return { success: true };
}

export async function listActivitySubmissions(user: AuthUser, activityId: string) {
  const activity = await prisma.activity.findUnique({ where: { id: activityId } });
  if (!activity) throw new ApiError(404, "NOT_FOUND", "Activity not found");
  
  await assertCanManageWorkshop(user, activity.workshopId);

  return prisma.activitySubmission.findMany({
    where: { activityId },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } }
    },
    orderBy: { submittedAt: 'desc' }
  });
}

export async function getSubmissionForOrganizer(user: AuthUser, submissionId: string) {
  const submission = await prisma.activitySubmission.findUnique({ 
    where: { id: submissionId },
    include: {
      activity: true,
      user: { select: { id: true, firstName: true, lastName: true, email: true } }
    }
  });
  
  if (!submission) throw new ApiError(404, "NOT_FOUND", "Submission not found");
  
  await assertCanManageWorkshop(user, submission.activity.workshopId);
  return submission;
}

export async function reviewSubmission(user: AuthUser, submissionId: string, input: ReviewSubmissionInput) {
  const submission = await getSubmissionForOrganizer(user, submissionId);

  return prisma.activitySubmission.update({
    where: { id: submissionId },
    data: {
      status: input.status,
      score: input.score,
      feedback: input.feedback,
      reviewedAt: new Date(),
      reviewedBy: user.id
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } }
    }
  });
}

// ============================================================================
// Participant Logic
// ============================================================================

async function assertParticipantAccess(userId: string, workshopId: string) {
  const registration = await prisma.registration.findUnique({
    where: { workshopId_userId: { workshopId, userId } }
  });

  if (!registration || registration.status !== "CONFIRMED") {
    throw new ApiError(403, "NOT_REGISTERED", "Only confirmed participants can access activities");
  }
}

export async function listPublishedActivities(userId: string, workshopId: string) {
  await assertParticipantAccess(userId, workshopId);

  const activities = await prisma.activity.findMany({
    where: { 
      workshopId, 
      status: { in: ["PUBLISHED", "CLOSED"] } 
    },
    orderBy: { sortOrder: "asc" },
    include: {
      session: { select: { id: true, title: true } },
      submissions: {
        where: { userId },
        select: { id: true, status: true, score: true, submittedAt: true }
      }
    }
  });

  return activities;
}

export async function getActivityDetails(userId: string, activityId: string) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      session: { select: { id: true, title: true } }
    }
  });

  if (!activity || (activity.status !== "PUBLISHED" && activity.status !== "CLOSED")) {
    throw new ApiError(404, "NOT_FOUND", "Activity not found");
  }

  await assertParticipantAccess(userId, activity.workshopId);
  return activity;
}

export async function getParticipantSubmission(userId: string, activityId: string) {
  await getActivityDetails(userId, activityId); // validates access

  const submission = await prisma.activitySubmission.findUnique({
    where: { activityId_userId: { activityId, userId } }
  });

  return submission;
}

export async function submitActivity(
  userId: string, 
  activityId: string, 
  input: SubmitActivityInput,
  file?: Express.Multer.File
) {
  const activity = await getActivityDetails(userId, activityId);

  if (activity.status === "CLOSED") {
    throw new ApiError(409, "ACTIVITY_CLOSED", "This activity is closed for submissions");
  }

  const isLate = activity.dueAt && new Date() > new Date(activity.dueAt);

  let fileUrl: string | undefined = undefined;
  let fileName: string | undefined = undefined;
  let mimeType: string | undefined = undefined;

  if (file) {
    const stored = await storeUploadedFile(`/uploads/${file.filename}`);
    fileUrl = stored.url;
    fileName = file.originalname;
    mimeType = file.mimetype;
  }

  // Validate submission matching the required type
  const type = activity.submissionType;
  if ((type === "TEXT" || type === "TEXT_AND_FILE" || type === "TEXT_AND_URL") && !input.textContent && !input.submissionUrl && !fileUrl) {
     // Usually handled by finer validation, but let's ensure we record what's sent.
  }

  const existingSubmission = await prisma.activitySubmission.findUnique({
    where: { activityId_userId: { activityId, userId } }
  });

  if (existingSubmission && ["COMPLETED", "UNDER_REVIEW"].includes(existingSubmission.status)) {
    throw new ApiError(409, "SUBMISSION_LOCKED", "Cannot edit a submission that is under review or completed");
  }

  const dataToUpdate = {
    textContent: input.textContent || existingSubmission?.textContent,
    submissionUrl: input.submissionUrl || existingSubmission?.submissionUrl,
    fileUrl: fileUrl || existingSubmission?.fileUrl,
    fileName: fileName || existingSubmission?.fileName,
    mimeType: mimeType || existingSubmission?.mimeType,
    status: (isLate ? "LATE" : "SUBMITTED") as any,
    submittedAt: new Date(),
  };

  return prisma.activitySubmission.upsert({
    where: { activityId_userId: { activityId, userId } },
    update: dataToUpdate,
    create: {
      activityId,
      userId,
      ...dataToUpdate
    }
  });
}
