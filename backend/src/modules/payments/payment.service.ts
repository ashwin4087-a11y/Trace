import { prisma } from "../../config/database";
import { verifyPaymentIntent } from "../../integrations/payments/payment.provider";
import { ApiError } from "../../shared/errors/api-error";
import { emitWorkshopDomainEvent } from "../workshops/workshop.events";

export async function getPayment(userId: string, orderId: string, isStaff: boolean) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true, registration: true },
  });
  if (!order) throw new ApiError(404, "NOT_FOUND", "Order not found");
  if (!isStaff && order.userId !== userId) throw new ApiError(403, "FORBIDDEN", "You cannot view this order");
  return order;
}

export async function verifyPayment(userId: string, orderId: string, providerReference: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true, registration: { include: { workshop: true } } },
  });
  if (!order || order.userId !== userId) throw new ApiError(404, "NOT_FOUND", "Order not found");

  // Idempotency: if already paid, return
  if (order.status === "PAID") {
    return getPayment(userId, orderId, false);
  }

  const paid = await verifyPaymentIntent({ orderId, providerReference });
  if (!paid) {
    // Payment failed
    await prisma.$transaction([
      prisma.payment.update({ where: { orderId }, data: { status: "FAILED" } }),
      prisma.order.update({ where: { id: orderId }, data: { status: "FAILED" } }),
    ]);
    throw new ApiError(402, "PAYMENT_NOT_VERIFIED", "Payment could not be verified");
  }

  // Payment is successful, now verify capacity in transaction
  const result = await prisma.$transaction(async (tx) => {
    const workshopId = order.registration.workshopId;
    const workshop = await tx.workshop.findUnique({ where: { id: workshopId } });
    if (!workshop) throw new Error("Workshop not found");
    
    const confirmedCount = await tx.registration.count({
      where: { workshopId, status: { in: ["CONFIRMED"] } },
    });

    let newStatus = "CONFIRMED";
    let isFull = false;
    
    if (workshop.capacity && confirmedCount >= workshop.capacity) {
      isFull = true;
      newStatus = workshop.waitlistEnabled ? "WAITLISTED" : "CANCELLED";
    }

    await tx.payment.update({
      where: { orderId },
      data: { status: "SUCCEEDED", providerReference },
    });
    await tx.order.update({ where: { id: orderId }, data: { status: "PAID" } });
    await tx.registration.update({
      where: { id: order.registrationId },
      data: { 
        status: newStatus as any,
        confirmedAt: newStatus === "CONFIRMED" ? new Date() : null,
      },
    });

    return { isFull, newStatus };
  });

  if (result.newStatus === "CONFIRMED") {
    await emitWorkshopDomainEvent({
      type: "REGISTRATION_CONFIRMED",
      userId,
      workshopId: order.registration.workshopId,
      workshopTitle: order.registration.workshop.title,
    });
  }

  if (result.isFull) {
    throw new ApiError(
      409, 
      "CAPACITY_REACHED_AFTER_PAYMENT", 
      result.newStatus === "WAITLISTED" 
        ? "Workshop filled up before your payment completed. You are on the waitlist." 
        : "Workshop filled up before your payment completed. Please contact support for a refund."
    );
  }

  return getPayment(userId, orderId, false);
}
