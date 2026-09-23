import { asyncHandler } from "../../shared/utils/async-handler";
import { comment } from "./community.service";

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await comment(req.user!.id, req.params.postId, req.body.body) });
});
