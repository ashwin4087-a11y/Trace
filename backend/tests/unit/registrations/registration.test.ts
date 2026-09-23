import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerForWorkshop, cancelRegistration, getRegistrationDetails, listForWorkshop } from "../../../src/modules/registrations/registration.service";
import { prisma } from "../../../src/config/database";
import { getSettings } from "../../../src/modules/settings/settings.service";

vi.mock("../../../src/config/database", () => ({
  prisma: {
    $transaction: vi.fn((cb) => cb(prisma)),
    workshop: { findUnique: vi.fn() },
    registration: { 
      findUnique: vi.fn(), 
      count: vi.fn(), 
      create: vi.fn(), 
      update: vi.fn(),
      findMany: vi.fn()
    },
    order: { upsert: vi.fn() },
  }
}));

vi.mock("../../../src/modules/settings/settings.service", () => ({
  getSettings: vi.fn()
}));

vi.mock("../../../src/modules/workshops/workshop.events", () => ({
  emitWorkshopDomainEvent: vi.fn()
}));

describe("Registration Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getSettings as any).mockResolvedValue({ registrationOpen: true });
  });

  describe("registerForWorkshop", () => {
    it("should throw if registration is closed globally", async () => {
      (getSettings as any).mockResolvedValue({ registrationOpen: false });
      await expect(registerForWorkshop("user1", "workshop1")).rejects.toThrow("Platform registration is closed");
    });

    it("should register successfully if conditions are met", async () => {
      (prisma.workshop.findUnique as any).mockResolvedValue({
        id: "workshop1",
        status: "PUBLISHED",
        registrationDeadline: new Date(Date.now() + 86400000), // Tomorrow
        capacity: 10,
        waitlistEnabled: true,
        priceCents: 0
      });
      (prisma.registration.findUnique as any).mockResolvedValueOnce(null); // Not already registered
      (prisma.registration.count as any).mockResolvedValue(5); // 5 out of 10
      (prisma.registration.create as any).mockResolvedValue({ id: "reg1", status: "CONFIRMED" });
      (prisma.registration.findUnique as any).mockResolvedValueOnce({ id: "reg1", status: "CONFIRMED" }); // for return

      const result = await registerForWorkshop("user1", "workshop1");
      expect(result.id).toBe("reg1");
      expect(prisma.registration.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          status: "CONFIRMED"
        })
      }));
    });

    it("should waitlist if capacity is reached and waitlist enabled", async () => {
      (prisma.workshop.findUnique as any).mockResolvedValue({
        id: "workshop1",
        status: "PUBLISHED",
        registrationDeadline: new Date(Date.now() + 86400000),
        capacity: 10,
        waitlistEnabled: true,
        priceCents: 0
      });
      (prisma.registration.findUnique as any).mockResolvedValueOnce(null);
      (prisma.registration.count as any).mockResolvedValue(10); // Full
      (prisma.registration.create as any).mockResolvedValue({ id: "reg2", status: "WAITLISTED" });
      (prisma.registration.findUnique as any).mockResolvedValueOnce({ id: "reg2", status: "WAITLISTED" }); 

      const result = await registerForWorkshop("user2", "workshop1");
      expect(result.id).toBe("reg2");
      expect(prisma.registration.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          status: "WAITLISTED"
        })
      }));
    });
  });

  describe("cancelRegistration", () => {
    it("should throw if not found", async () => {
      (prisma.registration.findUnique as any).mockResolvedValue(null);
      await expect(cancelRegistration("user1", "reg1", false)).rejects.toThrow("Registration not found");
    });

    it("should throw if user does not own registration and is not staff", async () => {
      (prisma.registration.findUnique as any).mockResolvedValue({ id: "reg1", userId: "user2" });
      await expect(cancelRegistration("user1", "reg1", false)).rejects.toThrow("You cannot cancel this registration");
    });

    it("should cancel if user owns registration", async () => {
      (prisma.registration.findUnique as any).mockResolvedValue({ id: "reg1", userId: "user1" });
      (prisma.registration.update as any).mockResolvedValue({ id: "reg1", status: "CANCELLED" });
      const result = await cancelRegistration("user1", "reg1", false);
      expect(result.status).toBe("CANCELLED");
      expect(prisma.registration.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: "CANCELLED" })
      }));
    });
  });

  describe("getRegistrationDetails", () => {
    it("should return details if owner requests it", async () => {
      (prisma.registration.findUnique as any).mockResolvedValue({ id: "reg1", userId: "user1", workshop: { organizerId: "org1" } });
      const result = await getRegistrationDetails("user1", "reg1", "PARTICIPANT");
      expect(result.id).toBe("reg1");
    });

    it("should throw if non-owner participant requests it", async () => {
      (prisma.registration.findUnique as any).mockResolvedValue({ id: "reg1", userId: "user2", workshop: { organizerId: "org1" } });
      await expect(getRegistrationDetails("user1", "reg1", "PARTICIPANT")).rejects.toThrow("You cannot view this registration");
    });
  });
});
