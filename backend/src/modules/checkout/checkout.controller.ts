import { asyncHandler } from "../../shared/utils/async-handler";
import { checkout } from "./checkout.service";

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await checkout(req.user!.id, req.body.registrationId) });
});
