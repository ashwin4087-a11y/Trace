import { prisma } from "../../config/database";
import { ApiError } from "../../shared/errors/api-error";
import type { AuthUser } from "../../shared/types/http";
import { assertCanManageWorkshop } from "../workshops/workshop.service";
import { CreateAssessmentInput, UpdateAssessmentInput, AssessmentQuestionInput, SubmitAttemptInput } from "./assessment.types";

// ============================================================================
// Organizer Operations
// ============================================================================

export async function assertCanManageAssessment(user: AuthUser, assessmentId: string) {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: { workshopId: true },
  });
  if (!assessment) throw new ApiError(404, "NOT_FOUND", "Assessment not found");
  await assertCanManageWorkshop(user, assessment.workshopId);
  return assessment;
}

export async function assertCanManageQuestion(user: AuthUser, questionId: string) {
  const question = await prisma.assessmentQuestion.findUnique({
    where: { id: questionId },
    select: { assessmentId: true },
  });
  if (!question) throw new ApiError(404, "NOT_FOUND", "Question not found");
  await assertCanManageAssessment(user, question.assessmentId);
  return question;
}

export async function listOrganizerAssessments(user: AuthUser, workshopId: string) {
  await assertCanManageWorkshop(user, workshopId);
  return prisma.assessment.findMany({
    where: { workshopId },
    include: {
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createAssessment(user: AuthUser, input: CreateAssessmentInput) {
  await assertCanManageWorkshop(user, input.workshopId);
  
  return prisma.assessment.create({
    data: {
      workshopId: input.workshopId,
      sessionId: input.sessionId,
      title: input.title,
      description: input.description,
      instructions: input.instructions,
      type: input.type ?? "QUIZ",
      durationMinutes: input.durationMinutes,
      passScore: input.passScore ?? 50,
      maxAttempts: input.maxAttempts ?? 1,
      isRequired: input.isRequired ?? true,
      dueAt: input.dueAt ? new Date(input.dueAt) : null,
      questions: input.questions ? {
        create: input.questions.map((q, i) => ({
          prompt: q.prompt,
          type: q.type,
          options: q.options,
          correctIndex: q.correctIndex,
          points: q.points ?? 1,
          explanation: q.explanation,
          sortOrder: i,
        }))
      } : undefined
    },
    include: { questions: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getAssessmentById(user: AuthUser, id: string) {
  await assertCanManageAssessment(user, id);
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: { questions: { orderBy: { sortOrder: "asc" } } },
  });
  if (!assessment) throw new ApiError(404, "NOT_FOUND", "Assessment not found");
  return assessment;
}

export async function updateAssessment(user: AuthUser, id: string, input: UpdateAssessmentInput) {
  await assertCanManageAssessment(user, id);
  return prisma.assessment.update({
    where: { id },
    data: {
      sessionId: input.sessionId,
      title: input.title,
      description: input.description,
      instructions: input.instructions,
      type: input.type,
      durationMinutes: input.durationMinutes,
      passScore: input.passScore,
      maxAttempts: input.maxAttempts,
      isRequired: input.isRequired,
      dueAt: input.dueAt ? new Date(input.dueAt) : input.dueAt === null ? null : undefined,
    },
  });
}

export async function deleteAssessment(user: AuthUser, id: string) {
  await assertCanManageAssessment(user, id);
  await prisma.assessment.delete({ where: { id } });
}

export async function publishAssessment(user: AuthUser, id: string) {
  await assertCanManageAssessment(user, id);
  
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: { questions: true }
  });
  
  if (!assessment || assessment.questions.length === 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "Cannot publish assessment without questions");
  }

  const maxPoints = assessment.questions.reduce((sum, q) => sum + q.points, 0);
  const passScoreNum = assessment.passScore;
  // passScore is percentage, so no direct limit checks needed on maxPoints unless we want to, but standard is %
  // just verify it's a valid assessment.

  return prisma.assessment.update({
    where: { id },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });
}

export async function closeAssessment(user: AuthUser, id: string) {
  await assertCanManageAssessment(user, id);
  return prisma.assessment.update({
    where: { id },
    data: { status: "CLOSED" },
  });
}

// Question Management

export async function addQuestion(user: AuthUser, assessmentId: string, input: AssessmentQuestionInput) {
  await assertCanManageAssessment(user, assessmentId);
  const count = await prisma.assessmentQuestion.count({ where: { assessmentId } });
  
  return prisma.assessmentQuestion.create({
    data: {
      assessmentId,
      prompt: input.prompt,
      type: input.type,
      options: input.options,
      correctIndex: input.correctIndex,
      points: input.points ?? 1,
      explanation: input.explanation,
      sortOrder: count,
    }
  });
}

export async function updateQuestion(user: AuthUser, questionId: string, input: Partial<AssessmentQuestionInput>) {
  await assertCanManageQuestion(user, questionId);
  return prisma.assessmentQuestion.update({
    where: { id: questionId },
    data: {
      prompt: input.prompt,
      type: input.type,
      options: input.options,
      correctIndex: input.correctIndex,
      points: input.points,
      explanation: input.explanation,
    }
  });
}

export async function deleteQuestion(user: AuthUser, questionId: string) {
  await assertCanManageQuestion(user, questionId);
  await prisma.assessmentQuestion.delete({ where: { id: questionId } });
}

export async function reorderQuestions(user: AuthUser, assessmentId: string, questionIds: string[]) {
  await assertCanManageAssessment(user, assessmentId);
  await prisma.$transaction(
    questionIds.map((id, index) =>
      prisma.assessmentQuestion.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );
}

// Results (Organizer)

export async function getAssessmentResults(user: AuthUser, assessmentId: string) {
  await assertCanManageAssessment(user, assessmentId);
  return prisma.assessmentAttempt.findMany({
    where: { assessmentId },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } }
    },
    orderBy: { submittedAt: 'desc' }
  });
}

// ============================================================================
// Participant Operations
// ============================================================================

export async function listParticipantAssessments(userId: string, workshopId: string) {
  const registration = await prisma.registration.findUnique({
    where: { workshopId_userId: { workshopId, userId } },
  });
  
  if (!registration || registration.status !== "CONFIRMED") {
    throw new ApiError(403, "NOT_REGISTERED", "Only confirmed participants can access assessments");
  }

  return prisma.assessment.findMany({
    where: { 
      workshopId, 
      status: { in: ["PUBLISHED", "CLOSED"] } 
    },
    include: {
      attempts: {
        where: { userId },
        orderBy: { attemptNumber: "desc" }
      }
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getParticipantAssessment(userId: string, id: string) {
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, prompt: true, type: true, options: true, points: true, sortOrder: true } // OMIT correctAnswer, explanation
      },
      attempts: {
        where: { userId },
        orderBy: { attemptNumber: "desc" },
        include: { answers: true }
      }
    }
  });

  if (!assessment) throw new ApiError(404, "NOT_FOUND", "Assessment not found");
  if (assessment.status === "DRAFT" || assessment.status === "ARCHIVED") {
    throw new ApiError(403, "FORBIDDEN", "Assessment is not available");
  }

  const registration = await prisma.registration.findUnique({
    where: { workshopId_userId: { workshopId: assessment.workshopId, userId } },
  });
  
  if (!registration || registration.status !== "CONFIRMED") {
    throw new ApiError(403, "NOT_REGISTERED", "Only confirmed participants can access assessments");
  }

  return assessment;
}

export async function startAttempt(userId: string, assessmentId: string) {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: { attempts: { where: { userId } } }
  });

  if (!assessment) throw new ApiError(404, "NOT_FOUND", "Assessment not found");
  if (assessment.status !== "PUBLISHED") {
    throw new ApiError(403, "FORBIDDEN", "Assessment is not currently published");
  }

  const registration = await prisma.registration.findUnique({
    where: { workshopId_userId: { workshopId: assessment.workshopId, userId } },
  });
  
  if (!registration || registration.status !== "CONFIRMED") {
    throw new ApiError(403, "NOT_REGISTERED", "Only confirmed participants can access assessments");
  }

  if (assessment.dueAt && new Date() > assessment.dueAt) {
    throw new ApiError(403, "EXPIRED", "The deadline for this assessment has passed");
  }

  const attemptsCount = assessment.attempts.length;
  if (attemptsCount >= assessment.maxAttempts) {
    throw new ApiError(403, "LIMIT_REACHED", "Maximum attempts reached for this assessment");
  }

  // Check for existing IN_PROGRESS attempt
  const inProgressAttempt = assessment.attempts.find(a => a.status === "IN_PROGRESS");
  if (inProgressAttempt) {
    return inProgressAttempt;
  }

  return prisma.assessmentAttempt.create({
    data: {
      assessmentId,
      userId,
      attemptNumber: attemptsCount + 1,
      status: "IN_PROGRESS",
      startedAt: new Date(),
    }
  });
}

export async function submitAttempt(userId: string, attemptId: string, input: SubmitAttemptInput) {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: { assessment: { include: { questions: true } } }
  });

  if (!attempt) throw new ApiError(404, "NOT_FOUND", "Attempt not found");
  if (attempt.userId !== userId) throw new ApiError(403, "FORBIDDEN", "Unauthorized attempt access");
  if (attempt.status !== "IN_PROGRESS") {
    throw new ApiError(400, "BAD_REQUEST", "Attempt is already submitted or expired");
  }

  const assessment = attempt.assessment;
  
  // Calculate expiry
  if (assessment.durationMinutes) {
    const expiredAt = new Date(attempt.startedAt.getTime() + (assessment.durationMinutes + 2) * 60000); // 2 min grace period
    if (new Date() > expiredAt) {
      await prisma.assessmentAttempt.update({
        where: { id: attemptId },
        data: { status: "EXPIRED" }
      });
      throw new ApiError(403, "EXPIRED", "Attempt time has expired");
    }
  }

  let totalScore = 0;
  let maxScore = 0;

  const answerRecords = assessment.questions.map(question => {
    maxScore += question.points;
    const userAnswer = input.answers.find(a => a.questionId === question.id);
    let isCorrect = false;
    let marksAwarded = 0;
    
    if (userAnswer && userAnswer.selectedOptionIndex !== undefined) {
      if (userAnswer.selectedOptionIndex === question.correctIndex) {
        isCorrect = true;
        marksAwarded = question.points;
        totalScore += question.points;
      }
    }

    return {
      attemptId,
      questionId: question.id,
      selectedOptionIndex: userAnswer?.selectedOptionIndex ?? null,
      isCorrect,
      marksAwarded,
    };
  });

  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  const passed = percentage >= assessment.passScore;

  const [updatedAttempt] = await prisma.$transaction([
    prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        score: totalScore,
        maxScore,
        percentage,
        passed,
      }
    }),
    prisma.assessmentAnswer.createMany({
      data: answerRecords
    })
  ]);

  return updatedAttempt;
}

export async function getAttemptResult(userId: string, attemptId: string) {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: {
      assessment: {
        include: { questions: { orderBy: { sortOrder: "asc" } } } // Full questions including explanation and correct index
      },
      answers: true
    }
  });

  if (!attempt) throw new ApiError(404, "NOT_FOUND", "Attempt not found");
  if (attempt.userId !== userId) throw new ApiError(403, "FORBIDDEN", "Unauthorized");
  if (attempt.status === "IN_PROGRESS") {
    throw new ApiError(403, "FORBIDDEN", "Cannot view results for in-progress attempt");
  }

  return attempt;
}
