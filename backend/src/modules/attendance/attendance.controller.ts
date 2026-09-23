import { asyncHandler } from "../../shared/utils/async-handler";
import * as attendance from "./attendance.service";

export const mark = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await attendance.markManual(req.user!, req.body) });
});

export const correct = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await attendance.correct(req.user!, req.params.id, req.body) });
});

export const qr = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await attendance.checkInWithQr(req.user!.id, req.body.token) });
});

export const workshop = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await attendance.historyForWorkshop(req.params.workshopId) });
});

export const mine = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await attendance.myHistory(req.user!.id) });
});

export const summary = asyncHandler(async (req, res) => {
  const userId = typeof req.query.userId === "string" ? req.query.userId : req.user!.id;
  if (userId !== req.user!.id && req.user!.role === "PARTICIPANT") {
    res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "You cannot view this attendance" } });
    return;
  }
  res.json({
    success: true,
    data: await attendance.summarize(userId, req.params.workshopId),
  });
});
