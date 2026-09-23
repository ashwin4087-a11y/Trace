import type { ActivityType } from "@prisma/client";
import { prisma } from "../../config/database";
import { ApiError } from "../../shared/errors/api-error";
import type { AuthUser } from "../../shared/types/http";
import { assertCanManageWorkshop } from "../workshops/workshop.service";

export async function listActivities(workshopId: string) {
  return prisma.activity.findMany({
    where: { workshopId },
    include: { submissions: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function createActivity(
  user: AuthUser,
  input: { workshopId: string; title: string; description: string; type: ActivityType; dueAt?: string },
) {
  await assertCanManageWorkshop(user, input.workshopId);
  return prisma.activity.create({
    data: {
      workshopId: input.workshopId,
      title: input.title,
      description: input.description,
      type: input.type,
      status: "OPEN",
      dueAt: input.dueAt ? new Date(input.dueAt) : undefined,
    },
  });
}

export async function submitActivity(userId: string, activityId: string, content: string) {
  const activity = await prisma.activity.findUnique({ where: { id: activityId } });
  if (!activity || activity.status !== "OPEN") {
    throw new ApiError(409, "ACTIVITY_CLOSED", "This activity is not open");
  }
  const registration = await prisma.registration.findUnique({
    where: { workshopId_userId: { workshopId: activity.workshopId, userId } },
  });
  if (!registration || registration.status !== "CONFIRMED") {
    throw new ApiError(403, "NOT_REGISTERED", "Only confirmed participants can submit");
  }
  return prisma.activitySubmission.upsert({
    where: { activityId_userId: { activityId, userId } },
    update: { content },
    create: { activityId, userId, content },
  });
}
