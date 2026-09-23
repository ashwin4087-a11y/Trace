import { asyncHandler } from "../../shared/utils/async-handler";
import * as profiles from "./profile.service";

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await profiles.getMyProfile(req.user!.id) });
});

export const options = asyncHandler(async (req, res) => {
  const organizationId = typeof req.query.organizationId === "string" ? req.query.organizationId : undefined;
  res.json({ success: true, data: await profiles.getProfileOptions(organizationId) });
});

export const update = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await profiles.upsertMyProfile(req.user!.id, req.body) });
});
