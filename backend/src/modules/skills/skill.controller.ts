import { asyncHandler } from "../../shared/utils/async-handler";
import * as skills from "./skill.service";

export const list = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await skills.listSkills() });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await skills.passport(req.user!.id) });
});

export const add = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await skills.addSkill(req.user!.id, req.body) });
});
