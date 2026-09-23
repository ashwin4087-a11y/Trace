import { prisma } from "../../config/database";
import { createPaymentIntent } from "../../integrations/payments/payment.provider";
import { ApiError } from "../../shared/errors/api-error";

export async function checkout(userId: string, registrationId: string) {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { order: true, workshop: true },
  });
  if (!registration || registration.userId !== userId) {
    throw new ApiError(404, "NOT_FOUND", "Registration not found");
  }
  if (!registration.order) {
    throw new ApiError(409, "NO_ORDER", "This registration has no payable order");
  }
  if (registration.order.status === "FREE" || registration.order.amountCents === 0) {
    return { order: registration.order, paymentRequired: false };
  }
  const intent = await createPaymentIntent({
    orderId: registration.order.id,
    amountCents: registration.order.amountCents,
    currency: registration.order.currency,
  });
  const payment = await prisma.payment.upsert({
    where: { orderId: registration.order.id },
    update: {
      provider: intent.provider,
      providerReference: intent.providerReference,
      status: "PENDING",
    },
    create: {
      orderId: registration.order.id,
      provider: intent.provider,
      providerReference: intent.providerReference,
      status: "PENDING",
      amountCents: registration.order.amountCents,
      currency: registration.order.currency,
    },
  });
  return { order: registration.order, payment, paymentRequired: true };
}
