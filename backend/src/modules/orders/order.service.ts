import { prisma } from "../../config/database";
import { ApiError } from "../../shared/errors/api-error";
import { registerForWorkshop } from "../registrations/registration.service";
import { checkout } from "../checkout/checkout.service";

export async function createOrder(userId: string, workshopId: string) {
  // 1. Check for existing pending registration
  let registration = await prisma.registration.findUnique({
    where: { workshopId_userId: { workshopId, userId } },
    include: { order: true, workshop: true },
  });

  // If confirmed, they don't need a new order
  if (registration && registration.status === "CONFIRMED") {
    throw new ApiError(409, "ALREADY_CONFIRMED", "You are already confirmed for this workshop");
  }

  // If pending payment or cancelled, we reuse or recreate the registration via registerForWorkshop
  if (!registration || registration.status === "CANCELLED") {
    const regResult = await registerForWorkshop(userId, workshopId);
    if (!regResult) throw new ApiError(500, "INTERNAL_ERROR", "Registration failed");
    registration = regResult;
  } else if (registration.status === "WAITLISTED") {
    // If waitlisted, they shouldn't be asked to pay immediately for a guaranteed seat
    throw new ApiError(409, "WAITLISTED", "You are on the waitlist. Payment is not required yet.");
  } else if (registration.status === "PENDING_PAYMENT") {
    // We already have a registration. Let's make sure it has an order.
    // If not, we could theoretically recreate it, but it should have an order.
    if (!registration.order) {
      throw new ApiError(409, "NO_ORDER", "This registration has no payable order");
    }
    // We also need to re-verify capacity before allowing checkout again just in case
    // wait, capacity verification during checkout creation is not strictly required if we do it in verifyPayment
    // but the prompt says: "8. ORDER VALIDATION Before creating an order: Verify: workshop exists, is active, etc."
    // Actually `checkout` will just return the intent. We will verify capacity on verifyPayment.
  }

  // 2. Checkout (creates payment intent)
  const checkoutData = await checkout(userId, registration.id);

  return checkoutData;
}

export async function listMine(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      registration: { include: { workshop: true } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderDetails(userId: string, orderId: string, role: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      registration: { include: { workshop: true } },
      payment: true,
    },
  });

  if (!order) throw new ApiError(404, "NOT_FOUND", "Order not found");

  if (role === "PARTICIPANT" && order.userId !== userId) {
    throw new ApiError(403, "FORBIDDEN", "You cannot view this order");
  }

  if ((role === "ORGANIZER" || role === "ADMIN") && order.userId !== userId && order.registration.workshop.organizerId !== userId && role !== "ADMIN") {
    throw new ApiError(403, "FORBIDDEN", "You cannot view this order");
  }

  return order;
}
