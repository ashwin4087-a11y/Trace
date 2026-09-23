import { describe, expect, it, beforeEach, vi } from "vitest";
import { prisma } from "../../../src/config/database";
import * as learningService from "../../../src/modules/learning/learning.service";
import { ApiError } from "../../../src/shared/errors/api-error";

vi.mock("../../../src/config/database", () => ({
  prisma: {
    learningMaterial: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    workshopSession: {
      findUnique: vi.fn(),
    },
    registration: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("../../../src/modules/workshops/workshop.service", () => ({
  assertCanManageWorkshop: vi.fn(),
}));

import { assertCanManageWorkshop } from "../../../src/modules/workshops/workshop.service";

describe("Learning Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const authUser = { id: "user-1", role: "PARTICIPANT" as const, email: "user@example.com", firstName: "Test", lastName: "User", status: "ACTIVE" as const, preferredLanguage: "EN" as const, createdAt: new Date(), updatedAt: new Date() };
  const organizerUser = { ...authUser, id: "org-1", role: "ORGANIZER" as const };

  describe("addMaterial", () => {
    it("should allow organizer to add material", async () => {
      vi.mocked(assertCanManageWorkshop).mockResolvedValue(undefined);
      vi.mocked(prisma.learningMaterial.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.learningMaterial.create).mockResolvedValue({ id: "mat-1" } as any);

      const result = await learningService.addMaterial(organizerUser, "ws-1", {
        title: "Test",
        type: "PDF",
        url: "http://example.com"
      });

      expect(result).toEqual({ id: "mat-1" });
      expect(prisma.learningMaterial.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ workshopId: "ws-1", title: "Test", sortOrder: 0, status: "DRAFT" })
      });
    });

    it("should reject session from another workshop", async () => {
      vi.mocked(assertCanManageWorkshop).mockResolvedValue(undefined);
      vi.mocked(prisma.workshopSession.findUnique).mockResolvedValue({ id: "sess-1", workshopId: "ws-2" } as any);

      await expect(learningService.addMaterial(organizerUser, "ws-1", {
        sessionId: "sess-1",
        title: "Test",
        type: "PDF",
        url: "http://example.com"
      })).rejects.toThrow(ApiError);
    });
  });

  describe("publishMaterial", () => {
    it("should fail if workshop is archived", async () => {
      vi.mocked(prisma.learningMaterial.findUnique).mockResolvedValue({ id: "mat-1", workshopId: "ws-1", workshop: { status: "ARCHIVED" } } as any);
      vi.mocked(assertCanManageWorkshop).mockResolvedValue(undefined);

      await expect(learningService.publishMaterial(organizerUser, "mat-1")).rejects.toThrow(/Cannot publish/);
    });
  });

  describe("getMaterialAccess", () => {
    it("should deny unauthenticated users", async () => {
      vi.mocked(prisma.learningMaterial.findUnique).mockResolvedValue({ id: "mat-1" } as any);
      await expect(learningService.getMaterialAccess(undefined, "mat-1")).rejects.toThrow(/Must be logged in/);
    });

    it("should deny if material is not published", async () => {
      vi.mocked(prisma.learningMaterial.findUnique).mockResolvedValue({ id: "mat-1", workshopId: "ws-1", status: "DRAFT" } as any);
      await expect(learningService.getMaterialAccess(authUser, "mat-1")).rejects.toThrow(/Material is not published/);
    });

    it("should deny if not registered", async () => {
      vi.mocked(prisma.learningMaterial.findUnique).mockResolvedValue({ id: "mat-1", workshopId: "ws-1", status: "PUBLISHED" } as any);
      vi.mocked(prisma.registration.findUnique).mockResolvedValue(null);

      await expect(learningService.getMaterialAccess(authUser, "mat-1")).rejects.toThrow(/Not registered/);
    });

    it("should deny if registration is PENDING_PAYMENT", async () => {
      vi.mocked(prisma.learningMaterial.findUnique).mockResolvedValue({ id: "mat-1", workshopId: "ws-1", status: "PUBLISHED" } as any);
      vi.mocked(prisma.registration.findUnique).mockResolvedValue({ status: "PENDING_PAYMENT" } as any);

      await expect(learningService.getMaterialAccess(authUser, "mat-1")).rejects.toThrow(/Registration status must be CONFIRMED/);
    });

    it("should allow if registration is CONFIRMED", async () => {
      vi.mocked(prisma.learningMaterial.findUnique).mockResolvedValue({ id: "mat-1", workshopId: "ws-1", status: "PUBLISHED", url: "https://secret.com" } as any);
      vi.mocked(prisma.registration.findUnique).mockResolvedValue({ status: "CONFIRMED" } as any);

      const result = await learningService.getMaterialAccess(authUser, "mat-1");
      expect(result.url).toBe("https://secret.com");
    });
    
    it("should allow organizer of the workshop regardless of publish status", async () => {
      vi.mocked(prisma.learningMaterial.findUnique).mockResolvedValue({ id: "mat-1", workshopId: "ws-1", status: "DRAFT", url: "https://secret.com" } as any);
      vi.mocked(assertCanManageWorkshop).mockResolvedValue(undefined);

      const result = await learningService.getMaterialAccess(organizerUser, "mat-1");
      expect(result.url).toBe("https://secret.com");
    });
  });
});
