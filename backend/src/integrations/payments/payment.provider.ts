import { env } from "../../config/environment";
import { ApiError } from "../../shared/errors/api-error";

/**
 * Provider boundary for payments.
 * This implementation never accepts or stores card numbers, CVV, or PAN data.
 * The dev provider only confirms an order reference created by this server.
 * A live gateway (Razorpay, Stripe, etc.) should replace this module later.
 */
export type PaymentIntent = {
  provider: string;
  providerReference: string;
};

export async function createPaymentIntent(input: {
  orderId: string;
  amountCents: number;
  currency: string;
}): Promise<PaymentIntent> {
  if (env.payment.provider === "dev" && !env.isProd) {
    return { provider: "dev", providerReference: `dev_${input.orderId}` };
  }
  if (!env.payment.key || !env.payment.secret) {
    throw new ApiError(
      501,
      "PAYMENT_PROVIDER_NOT_CONFIGURED",
      "Paid checkout needs a payment provider. Free workshops do not.",
    );
  }
  throw new ApiError(
    501,
    "PAYMENT_PROVIDER_NOT_IMPLEMENTED",
    "The configured payment provider is not wired yet. Orders are recorded without card data.",
  );
}

export async function verifyPaymentIntent(input: {
  orderId: string;
  providerReference: string;
}): Promise<boolean> {
  if (env.payment.provider === "dev" && !env.isProd) {
    return input.providerReference === `dev_${input.orderId}`;
  }
  return false;
}

export async function refundPayment(input: {
  orderId: string;
  providerReference: string;
}): Promise<boolean> {
  if (env.payment.provider === "dev" && !env.isProd) {
    return true; // Mock refund
  }
  throw new ApiError(
    501,
    "PAYMENT_PROVIDER_NOT_IMPLEMENTED",
    "Refunds are not implemented for the current payment provider.",
  );
}
