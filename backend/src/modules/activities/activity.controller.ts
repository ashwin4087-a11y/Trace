import { asyncHandler } from "../../shared/utils/async-handler";
import * as activities from "./activity.service";

export const list = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await activities.listActivities(String(req.query.workshopId)) });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await activities.createActivity(req.user!, req.body) });
});

export const submit = asyncHandler(async (req, res) => {
  res.status(201).json({
    success: true,
    data: await activities.submitActivity(req.user!.id, req.params.id, req.body.content),
  });
});
