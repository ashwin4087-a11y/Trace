import { prisma } from "../../config/database";
import { ApiError } from "../../shared/errors/api-error";
import type { AuthUser } from "../../shared/types/http";
import { assertCanManageWorkshop } from "../workshops/workshop.service";

type QuestionInput = {
  prompt: string;
  type: "MCQ" | "SHORT_ANSWER";
  options?: string[];
  correctIndex?: number;
  points?: number;
};

export async function listAssessments(workshopId: string, includeAnswers: boolean) {
  return prisma.assessment.findMany({
    where: { workshopId },
    include: {
      questions: includeAnswers
        ? { orderBy: { sortOrder: "asc" as const } }
        : {
            orderBy: { sortOrder: "asc" as const },
            select: { id: true, prompt: true, type: true, options: true, points: true, sortOrder: true },
          },
      submissions: includeAnswers,
    },
  });
}

export async function createAssessment(
  user: AuthUser,
  input: { workshopId: string; title: string; description?: string; passScore?: number; questions: QuestionInput[] },
) {
  await assertCanManageWorkshop(user, input.workshopId);
  return prisma.assessment.create({
    data: {
      workshopId: input.workshopId,
      title: input.title,
      description: input.description,
      passScore: input.passScore ?? 50,
      questions: {
        create: input.questions.map((question, index) => ({
          prompt: question.prompt,
          type: question.type,
          options: question.options,
          correctIndex: question.correctIndex,
          points: question.points ?? 1,
          sortOrder: index,
        })),
      },
    },
    include: { questions: true },
  });
}

export async function submitAssessment(userId: string, assessmentId: string, answers: number[]) {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: { questions: { orderBy: { sortOrder: "asc" } } },
  });
  if (!assessment) throw new ApiError(404, "NOT_FOUND", "Assessment not found");
  const registration = await prisma.registration.findUnique({
    where: { workshopId_userId: { workshopId: assessment.workshopId, userId } },
  });
  if (!registration || registration.status !== "CONFIRMED") {
    throw new ApiError(403, "NOT_REGISTERED", "Only confirmed participants can submit");
  }
  let score = 0;
  let maxScore = 0;
  assessment.questions.forEach((question, index) => {
    maxScore += question.points;
    if (question.type === "MCQ" && question.correctIndex !== null && answers[index] === question.correctIndex) {
      score += question.points;
    }
  });
  return prisma.assessmentSubmission.upsert({
    where: { assessmentId_userId: { assessmentId, userId } },
    update: { answers, score, maxScore, status: "GRADED" },
    create: { assessmentId, userId, answers, score, maxScore, status: "GRADED" },
  });
}
