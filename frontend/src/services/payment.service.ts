import { api, unwrap } from "./api";

export async function checkout(registrationId: string) {
  return unwrap<{ paymentRequired: boolean; order: { id: string }; payment?: { providerReference: string } }>(
    await api.post("/checkout", { registrationId }),
  );
}
export async function verifyPayment(orderId: string, providerReference: string) {
  return unwrap<unknown>(await api.post(`/payments/${orderId}/verify`, { providerReference }));
}
