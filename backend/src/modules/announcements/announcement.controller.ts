import { asyncHandler } from "../../shared/utils/async-handler";
import * as announcements from "./announcement.service";

export const list = asyncHandler(async (req, res) => {
  const workshopId = typeof req.query.workshopId === "string" ? req.query.workshopId : undefined;
  res.json({ success: true, data: await announcements.listAnnouncements(workshopId) });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await announcements.createAnnouncement(req.user!, req.body) });
});
