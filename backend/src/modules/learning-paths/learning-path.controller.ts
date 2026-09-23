import { asyncHandler } from "../../shared/utils/async-handler";
import * as paths from "./learning-path.service";

export const list = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await paths.listPaths() });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await paths.createPath(req.body) });
});

export const enroll = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await paths.enroll(req.user!.id, req.params.id) });
});

export const mine = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await paths.myPaths(req.user!.id) });
});
