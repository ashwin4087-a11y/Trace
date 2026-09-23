import { asyncHandler } from "../../shared/utils/async-handler";
import * as sessions from "./session.service";

export const list = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await sessions.listSessions(String(req.query.workshopId)) });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await sessions.createSession(req.user!, req.body) });
});

export const update = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await sessions.updateSession(req.user!, req.params.id, req.body) });
});

export const qr = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await sessions.issueQrToken(req.user!, req.params.id) });
});
