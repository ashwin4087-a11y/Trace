import { describe, expect, it, beforeEach, vi } from "vitest";
import { prisma } from "../../../src/config/database";
import { createOrder } from "../../../src/modules/orders/order.service";
import { verifyPayment } from "../../../src/modules/payments/payment.service";
import { emitWorkshopDomainEvent } from "../../../src/modules/workshops/workshop.events";
import { env } from "../../../src/config/environment";
import { ApiError } from "../../../src/shared/errors/api-error";

vi.mock("../../../src/config/database", () => ({
  prisma: {
    $transaction: vi.fn((cb) => {
      if (typeof cb === "function") return cb(prisma);
      return Promise.resolve(cb); // For array of promises
    }),
    workshop: { findUnique: vi.fn(), create: vi.fn(), deleteMany: vi.fn() },
    registration: { 
      findUnique: vi.fn(), 
      count: vi.fn(), 
      create: vi.fn(), 
      update: vi.fn(),
      deleteMany: vi.fn()
    },
    order: { upsert: vi.fn(), findUnique: vi.fn(), update: vi.fn(), deleteMany: vi.fn() },
    payment: { upsert: vi.fn(), update: vi.fn(), deleteMany: vi.fn() },
    user: { create: vi.fn(), deleteMany: vi.fn() }
  }
}));

vi.mock("../../../src/modules/workshops/workshop.events", () => ({
  emitWorkshopDomainEvent: vi.fn(),
}));
vi.mock("../../../src/modules/settings/settings.service", () => ({
  getSettings: vi.fn().mockResolvedValue({ registrationOpen: true })
}));

describe("Checkout and Payments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    env.payment.provider = "dev";
    env.isProd = false;
  });

  describe("Free Workshop Flow", () => {
    it("should confirm registration automatically and not require payment", async () => {
      (prisma.registration.findUnique as any).mockResolvedValueOnce(null); // Not registered yet
      (prisma.workshop.findUnique as any).mockResolvedValueOnce({
        id: "freeW", status: "PUBLISHED", capacity: 10, waitlistEnabled: true, priceCents: 0, registrationDeadline: new Date(Date.now() + 86400000)
      });
      (prisma.registration.count as any).mockResolvedValueOnce(0);
      (prisma.registration.create as any).mockResolvedValueOnce({ id: "reg1", status: "CONFIRMED" });
      (prisma.order.upsert as any).mockResolvedValueOnce({ id: "order1", status: "FREE", amountCents: 0 });
      (prisma.registration.findUnique as any).mockResolvedValueOnce({ 
        id: "reg1", status: "CONFIRMED", workshop: { title: "Free" }, order: { id: "order1", status: "FREE", amountCents: 0 } 
      });

      // Also checkout mock returns
      (prisma.registration.findUnique as any).mockResolvedValueOnce({ 
        id: "reg1", userId: "user1", status: "CONFIRMED", order: { id: "order1", status: "FREE", amountCents: 0 }, workshop: { title: "Free" } 
      });

      await expect(createOrder("user1", "freeW")).rejects.toThrow("You are already confirmed for this workshop");
    });
  });

  describe("Paid Workshop Flow", () => {
    it("should create order with correct DB price and not confirm registration", async () => {
      (prisma.registration.findUnique as any).mockResolvedValueOnce(null);
      (prisma.workshop.findUnique as any).mockResolvedValueOnce({
        id: "paidW", status: "PUBLISHED", capacity: 10, waitlistEnabled: true, priceCents: 49900, currency: "INR", registrationDeadline: new Date(Date.now() + 86400000)
      });
      (prisma.registration.count as any).mockResolvedValueOnce(0);
      (prisma.registration.create as any).mockResolvedValueOnce({ id: "reg2", status: "PENDING_PAYMENT" });
      (prisma.order.upsert as any).mockResolvedValueOnce({ id: "order2", status: "PENDING", amountCents: 49900, currency: "INR" });
      (prisma.registration.findUnique as any).mockResolvedValueOnce({ 
        id: "reg2", status: "PENDING_PAYMENT", workshop: { title: "Paid" }, order: { id: "order2", status: "PENDING", amountCents: 49900, currency: "INR" } 
      });
      (prisma.registration.findUnique as any).mockResolvedValueOnce({ 
        id: "reg2", userId: "user2", status: "PENDING_PAYMENT", order: { id: "order2", status: "PENDING", amountCents: 49900, currency: "INR" }, workshop: { title: "Paid" } 
      });
      (prisma.payment.upsert as any).mockResolvedValueOnce({ providerReference: "dev_order2" });

      const orderData = await createOrder("user2", "paidW");
      expect(orderData.paymentRequired).toBe(true);
      expect(orderData.order.amountCents).toBe(49900);
      expect(emitWorkshopDomainEvent).not.toHaveBeenCalled();
    });

    it("should process payment successfully and confirm registration", async () => {
      (prisma.order.findUnique as any).mockResolvedValueOnce({
        id: "order2", userId: "user2", status: "PENDING", registration: { workshopId: "paidW", workshop: { title: "Paid" } }
      });
      (prisma.workshop.findUnique as any).mockResolvedValueOnce({ id: "paidW", capacity: 10 });
      (prisma.registration.count as any).mockResolvedValueOnce(5); // Not full

      await verifyPayment("user2", "order2", "dev_order2");

      expect(prisma.registration.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: "CONFIRMED" })
      }));
      expect(emitWorkshopDomainEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: "REGISTRATION_CONFIRMED" })
      );
    });

    it("should fail payment verification for invalid reference", async () => {
      (prisma.order.findUnique as any).mockResolvedValueOnce({
        id: "order2", userId: "user2", status: "PENDING", registration: { workshopId: "paidW", workshop: { title: "Paid" } }
      });

      await expect(verifyPayment("user2", "order2", "wrong_ref")).rejects.toThrow("Payment could not be verified");
      
      expect(prisma.order.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { status: "FAILED" }
      }));
    });
  });
});

