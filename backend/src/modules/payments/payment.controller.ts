import { asyncHandler } from "../../shared/utils/async-handler";
import * as payments from "./payment.service";

export const get = asyncHandler(async (req, res) => {
  const isStaff = req.user!.role !== "PARTICIPANT";
  res.json({ success: true, data: await payments.getPayment(req.user!.id, req.params.orderId, isStaff) });
});

export const verify = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: await payments.verifyPayment(req.user!.id, req.params.orderId, req.body.providerReference),
  });
});
