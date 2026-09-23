import type { AcademicDomain } from "@prisma/client";
import { prisma } from "../../config/database";
import { ApiError } from "../../shared/errors/api-error";

export async function listPaths() {
  return prisma.learningPath.findMany({
    where: { status: "PUBLISHED" },
    include: { steps: { include: { workshop: true }, orderBy: { position: "asc" } } },
  });
}

export async function createPath(input: {
  title: string;
  description: string;
  domain?: AcademicDomain;
  workshopIds: string[];
}) {
  return prisma.learningPath.create({
    data: {
      title: input.title,
      description: input.description,
      domain: input.domain,
      status: "PUBLISHED",
      steps: {
        create: input.workshopIds.map((workshopId, position) => ({ workshopId, position })),
      },
    },
    include: { steps: true },
  });
}

export async function enroll(userId: string, learningPathId: string) {
  const path = await prisma.learningPath.findUnique({ where: { id: learningPathId } });
  if (!path || path.status !== "PUBLISHED") throw new ApiError(404, "NOT_FOUND", "Learning path not found");
  return prisma.learningPathEnrollment.upsert({
    where: { learningPathId_userId: { learningPathId, userId } },
    update: {},
    create: { learningPathId, userId },
  });
}

export async function myPaths(userId: string) {
  const enrollments = await prisma.learningPathEnrollment.findMany({
    where: { userId },
    include: { learningPath: { include: { steps: { include: { workshop: true }, orderBy: { position: "asc" } } } } },
  });
  const certificates = await prisma.certificate.findMany({ where: { userId, status: "ISSUED" } });
  const done = new Set(certificates.map((item) => item.workshopId));
  return enrollments.map((enrollment) => {
    const completedSteps = enrollment.learningPath.steps.filter((step) => done.has(step.workshopId)).length;
    return { ...enrollment, completedSteps, totalSteps: enrollment.learningPath.steps.length };
  });
}
