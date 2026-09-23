import { asyncHandler } from "../../shared/utils/async-handler";
import { createPost } from "./community.service";

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await createPost(req.user!, req.body) });
});
