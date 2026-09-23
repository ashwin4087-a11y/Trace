import { describe, it, expect, vi, beforeEach } from "vitest";
import * as attendanceService from "../../../src/modules/attendance/attendance.service";
import { prisma } from "../../../src/config/database";
import { ApiError } from "../../../src/shared/errors/api-error";
import * as workshopService from "../../../src/modules/workshops/workshop.service";

vi.mock("../../../src/config/database", () => ({
  prisma: {
    workshopSession: { findUnique: vi.fn(), findMany: vi.fn() },
    registration: { findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn() },
    attendance: { createMany: vi.fn(), findMany: vi.fn(), upsert: vi.fn(), update: vi.fn(), count: vi.fn() },
    $transaction: vi.fn((cb) => cb(prisma)),
  },
}));

vi.mock("../../../src/modules/workshops/workshop.service", () => ({
  assertCanManageWorkshop: vi.fn(),
}));

describe("Attendance Service", () => {
  const actor = { id: "org1", role: "ORGANIZER" as const, email: "org1@test.com", status: "ACTIVE" as const, firstName: "O", lastName: "1" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initialize", () => {
    it("should initialize attendance for confirmed registrations only", async () => {
      vi.mocked(prisma.workshopSession.findUnique).mockResolvedValue({ id: "session1", workshopId: "ws1" } as any);
      vi.mocked(prisma.registration.findMany).mockResolvedValue([
        { id: "reg1", userId: "user1", status: "CONFIRMED" },
        { id: "reg2", userId: "user2", status: "CONFIRMED" },
      ] as any);
      vi.mocked(prisma.attendance.findMany).mockResolvedValue([]);
      vi.mocked(prisma.attendance.createMany).mockResolvedValue({ count: 2 } as any);

      const result = await attendanceService.initialize(actor, "session1");
      expect(result.count).toBe(2);
      expect(prisma.attendance.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({ registrationId: "reg1", status: "ABSENT" }),
            expect.objectContaining({ registrationId: "reg2", status: "ABSENT" }),
          ]),
        })
      );
    });

    it("should skip existing attendance records", async () => {
      vi.mocked(prisma.workshopSession.findUnique).mockResolvedValue({ id: "session1", workshopId: "ws1" } as any);
      vi.mocked(prisma.registration.findMany).mockResolvedValue([
        { id: "reg1", userId: "user1", status: "CONFIRMED" },
        { id: "reg2", userId: "user2", status: "CONFIRMED" },
      ] as any);
      vi.mocked(prisma.attendance.findMany).mockResolvedValue([{ registrationId: "reg1" } as any]);
      vi.mocked(prisma.attendance.createMany).mockResolvedValue({ count: 1 } as any);

      const result = await attendanceService.initialize(actor, "session1");
      expect(result.count).toBe(1);
    });
  });

  describe("bulkMark", () => {
    it("should bulk mark attendance for valid registrations", async () => {
      vi.mocked(prisma.workshopSession.findUnique).mockResolvedValue({ id: "session1", workshopId: "ws1" } as any);
      vi.mocked(prisma.registration.findMany).mockResolvedValue([
        { id: "reg1", userId: "user1", status: "CONFIRMED", workshopId: "ws1" },
      ] as any);
      vi.mocked(prisma.attendance.upsert).mockResolvedValue({ id: "att1" } as any);

      const result = await attendanceService.bulkMark(actor, "session1", { registrationIds: ["reg1"], status: "PRESENT" });
      expect(result.updated).toBe(1);
    });

    it("should throw error if any registration is invalid or not confirmed", async () => {
      vi.mocked(prisma.workshopSession.findUnique).mockResolvedValue({ id: "session1", workshopId: "ws1" } as any);
      vi.mocked(prisma.registration.findMany).mockResolvedValue([]);

      await expect(attendanceService.bulkMark(actor, "session1", { registrationIds: ["reg1"], status: "PRESENT" })).rejects.toThrow(ApiError);
    });
  });

  describe("markManual", () => {
    it("should allow marking attendance for confirmed user", async () => {
      vi.mocked(prisma.workshopSession.findUnique).mockResolvedValue({ id: "session1", workshopId: "ws1" } as any);
      vi.mocked(prisma.registration.findUnique).mockResolvedValue({ id: "reg1", userId: "user1", workshopId: "ws1", status: "CONFIRMED" } as any);
      vi.mocked(prisma.attendance.upsert).mockResolvedValue({ id: "att1", status: "PRESENT" } as any);

      const result = await attendanceService.markManual(actor, { sessionId: "session1", registrationId: "reg1", status: "PRESENT" });
      expect(result.status).toBe("PRESENT");
    });

    it("should throw if user is not confirmed and trying to mark PRESENT", async () => {
      vi.mocked(prisma.workshopSession.findUnique).mockResolvedValue({ id: "session1", workshopId: "ws1" } as any);
      vi.mocked(prisma.registration.findUnique).mockResolvedValue({ id: "reg1", userId: "user1", workshopId: "ws1", status: "PENDING_PAYMENT" } as any);

      await expect(attendanceService.markManual(actor, { sessionId: "session1", registrationId: "reg1", status: "PRESENT" })).rejects.toThrow(ApiError);
    });
  });
});
