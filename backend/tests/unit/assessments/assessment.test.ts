import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../../src/config/database";
import * as assessmentService from "../../../src/modules/assessments/assessment.service";
import { ApiError } from "../../../src/shared/errors/api-error";

vi.mock("../../../src/config/database", () => ({
  prisma: {
    assessment: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    assessmentAttempt: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    assessmentAnswer: {
      createMany: vi.fn(),
    },
    registration: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(async (cb) => {
      if (Array.isArray(cb)) {
        return Promise.all(cb);
      }
      return cb(prisma);
    }),
  },
}));

// Mock `assertCanManageWorkshop`
vi.mock("../../../src/modules/workshops/workshop.service", () => ({
  assertCanManageWorkshop: vi.fn(),
}));

describe("Assessment Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getParticipantAssessment", () => {
    it("should return assessment without correct answers and explanations", async () => {
      const mockAssessment = {
        id: "a1",
        workshopId: "w1",
        status: "PUBLISHED",
        questions: [
          { id: "q1", prompt: "Q1", type: "MCQ_SINGLE", options: ["A", "B"], points: 1, sortOrder: 0 },
        ],
        attempts: []
      };

      vi.mocked(prisma.assessment.findUnique).mockResolvedValue(mockAssessment as any);
      vi.mocked(prisma.registration.findUnique).mockResolvedValue({ status: "CONFIRMED" } as any);

      const result = await assessmentService.getParticipantAssessment("user1", "a1");
      expect(result.questions[0]).not.toHaveProperty("correctIndex");
      expect(result.questions[0]).not.toHaveProperty("explanation");
    });

    it("should throw if user is not CONFIRMED", async () => {
      vi.mocked(prisma.assessment.findUnique).mockResolvedValue({ id: "a1", workshopId: "w1", status: "PUBLISHED" } as any);
      vi.mocked(prisma.registration.findUnique).mockResolvedValue({ status: "PENDING_PAYMENT" } as any);

      await expect(assessmentService.getParticipantAssessment("user1", "a1")).rejects.toThrow(ApiError);
    });
  });

  describe("submitAttempt", () => {
    it("should evaluate answers correctly and set PASSED", async () => {
      const mockAttempt = {
        id: "att1",
        userId: "user1",
        status: "IN_PROGRESS",
        startedAt: new Date(),
        assessment: {
          id: "a1",
          passScore: 50,
          questions: [
            { id: "q1", points: 10, correctIndex: 1 },
            { id: "q2", points: 10, correctIndex: 0 },
          ]
        }
      };

      vi.mocked(prisma.assessmentAttempt.findUnique).mockResolvedValue(mockAttempt as any);
      vi.mocked(prisma.assessmentAttempt.update).mockResolvedValue({} as any);
      vi.mocked(prisma.assessmentAnswer.createMany).mockResolvedValue({} as any);

      await assessmentService.submitAttempt("user1", "att1", {
        answers: [
          { questionId: "q1", selectedOptionIndex: 1 }, // Correct (10/10)
          { questionId: "q2", selectedOptionIndex: 1 }, // Incorrect (0/10)
        ]
      });

      // Total score should be 10/20 (50%). PassScore is 50, so passed = true
      expect(prisma.assessmentAttempt.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: "att1" },
        data: expect.objectContaining({
          score: 10,
          maxScore: 20,
          percentage: 50,
          passed: true,
          status: "SUBMITTED"
        })
      }));
    });
  });
});
