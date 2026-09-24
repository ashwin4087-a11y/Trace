import { asyncHandler } from "../../shared/utils/async-handler";
import * as analytics from "./analytics.service";

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await analytics.participantAnalytics(req.user!.id) });
});

export const organizer = asyncHandler(async (req, res) => {
  const workshopId = typeof req.query.workshopId === "string" ? req.query.workshopId : undefined;
  res.json({ success: true, data: await analytics.organizerAnalytics(req.user!.id, workshopId) });
});

export const platform = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await analytics.platformAnalytics() });
});
