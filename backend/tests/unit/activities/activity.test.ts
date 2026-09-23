import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  createActivity, 
  getActivityDetails, 
  submitActivity,
  reviewSubmission
} from "../../../src/modules/activities/activity.service";
import { prisma } from "../../../src/config/database";
import { ApiError } from "../../../src/shared/errors/api-error";

vi.mock("../../../src/config/database", () => ({
  prisma: {
    workshop: { findUnique: vi.fn() },
    activity: { findUnique: vi.fn(), create: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    registration: { findUnique: vi.fn() },
    activitySubmission: { findUnique: vi.fn(), upsert: vi.fn(), update: vi.fn() },
    workshopSession: { findUnique: vi.fn() },
  },
}));

describe("Activity Service", () => {
  const organizerUser = { id: "org1", role: "ORGANIZER" as const, email: "org@example.com", firstName: "O", lastName: "R", status: "ACTIVE" as const };
  const participantUser = { id: "part1", role: "PARTICIPANT" as const, email: "p@example.com", firstName: "P", lastName: "A", status: "ACTIVE" as const };
  const workshopId = "workshop1";
  const activityId = "act1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createActivity", () => {
    it("should allow organizer of the workshop to create activity", async () => {
      vi.mocked(prisma.workshop.findUnique).mockResolvedValue({ organizerId: organizerUser.id } as any);
      vi.mocked(prisma.activity.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.activity.create).mockResolvedValue({ id: activityId } as any);

      const result = await createActivity(organizerUser, {
        workshopId,
        title: "Test Activity",
        description: "Test Desc",
        type: "ASSIGNMENT",
        isRequired: true,
        submissionType: "TEXT",
      });

      expect(result.id).toBe(activityId);
      expect(prisma.activity.create).toHaveBeenCalled();
    });

    it("should deny organizer from another workshop", async () => {
      vi.mocked(prisma.workshop.findUnique).mockResolvedValue({ organizerId: "other-org" } as any);

      await expect(
        createActivity(organizerUser, {
          workshopId,
          title: "Test Activity",
          description: "Test Desc",
          type: "ASSIGNMENT",
          isRequired: true,
          submissionType: "TEXT",
        })
      ).rejects.toThrow(ApiError);
    });
  });

  describe("getActivityDetails", () => {
    it("should return details for confirmed participant", async () => {
      vi.mocked(prisma.activity.findUnique).mockResolvedValue({ 
        id: activityId, workshopId, status: "PUBLISHED" 
      } as any);
      vi.mocked(prisma.registration.findUnique).mockResolvedValue({ status: "CONFIRMED" } as any);

      const result = await getActivityDetails(participantUser.id, activityId);
      expect(result.id).toBe(activityId);
    });

    it("should deny access for pending payment participant", async () => {
      vi.mocked(prisma.activity.findUnique).mockResolvedValue({ 
        id: activityId, workshopId, status: "PUBLISHED" 
      } as any);
      vi.mocked(prisma.registration.findUnique).mockResolvedValue({ status: "PENDING_PAYMENT" } as any);

      await expect(getActivityDetails(participantUser.id, activityId)).rejects.toThrow(ApiError);
    });
  });

  describe("submitActivity", () => {
    it("should allow submission if activity is published and participant is confirmed", async () => {
      vi.mocked(prisma.activity.findUnique).mockResolvedValue({ 
        id: activityId, workshopId, status: "PUBLISHED", submissionType: "TEXT" 
      } as any);
      vi.mocked(prisma.registration.findUnique).mockResolvedValue({ status: "CONFIRMED" } as any);
      vi.mocked(prisma.activitySubmission.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.activitySubmission.upsert).mockResolvedValue({ id: "sub1", status: "SUBMITTED" } as any);

      const result = await submitActivity(participantUser.id, activityId, { textContent: "My answer" });
      
      expect(result.status).toBe("SUBMITTED");
      expect(prisma.activitySubmission.upsert).toHaveBeenCalled();
    });

    it("should mark submission as LATE if after deadline", async () => {
      vi.mocked(prisma.activity.findUnique).mockResolvedValue({ 
        id: activityId, workshopId, status: "PUBLISHED", submissionType: "TEXT",
        dueAt: new Date(Date.now() - 10000) // 10s ago
      } as any);
      vi.mocked(prisma.registration.findUnique).mockResolvedValue({ status: "CONFIRMED" } as any);
      vi.mocked(prisma.activitySubmission.findUnique).mockResolvedValue(null);
      
      let upsertCall: any;
      vi.mocked(prisma.activitySubmission.upsert).mockImplementation((args: any) => {
        upsertCall = args;
        return { id: "sub1", status: "LATE" } as any;
      });

      const result = await submitActivity(participantUser.id, activityId, { textContent: "My answer" });
      
      expect(result.status).toBe("LATE");
      expect(upsertCall.update.status).toBe("LATE");
    });
  });
});
