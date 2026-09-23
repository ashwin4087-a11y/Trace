import { prisma } from "../../config/database";
import { verifyPaymentIntent } from "../../integrations/payments/payment.provider";
import { ApiError } from "../../shared/errors/api-error";
import { notifyRegistration } from "../notifications/notification.service";

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
  const paid = await verifyPaymentIntent({ orderId, providerReference });
  if (!paid) throw new ApiError(402, "PAYMENT_NOT_VERIFIED", "Payment could not be verified");

  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId },
      data: { status: "SUCCEEDED", providerReference },
    }),
    prisma.order.update({ where: { id: orderId }, data: { status: "PAID" } }),
    prisma.registration.update({
      where: { id: order.registrationId },
      data: { status: "CONFIRMED" },
    }),
  ]);
  await notifyRegistration(userId, order.registration.workshop.title);
  return getPayment(userId, orderId, false);
}
