import { asyncHandler } from "../../shared/utils/async-handler";
import { recommendForUser } from "./recommendation.service";

export const mine = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await recommendForUser(req.user!.id) });
});
