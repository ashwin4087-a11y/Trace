import { asyncHandler } from "../../shared/utils/async-handler";
import * as registrations from "./registration.service";

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({
    success: true,
    data: await registrations.registerForWorkshop(req.user!.id, req.body.workshopId),
  });
});

export const mine = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await registrations.listMine(req.user!.id) });
});

export const byWorkshop = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await registrations.listForWorkshop(String(req.query.workshopId)) });
});

export const cancel = asyncHandler(async (req, res) => {
  const isStaff = req.user!.role === "ADMIN" || req.user!.role === "ORGANIZER";
  res.json({
    success: true,
    data: await registrations.cancelRegistration(req.user!.id, req.params.id, isStaff),
  });
});
