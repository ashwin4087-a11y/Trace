import { asyncHandler } from "../../shared/utils/async-handler";
import * as settings from "./settings.service";

export const get = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await settings.getSettings() });
});

export const update = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await settings.updateSettings(req.body) });
});
