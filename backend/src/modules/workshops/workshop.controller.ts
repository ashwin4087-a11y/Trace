import type { Request } from "express";
import { asyncHandler } from "../../shared/utils/async-handler";
import { pageMeta } from "../../shared/utils/pagination";
import * as workshops from "./workshop.service";
import * as registrations from "../registrations/registration.service";
import { listWorkshopSchema } from "./workshop.validation";

export const list = asyncHandler(async (req, res) => {
  const parsed = listWorkshopSchema.parse({ query: req.query });
  const result = await workshops.listWorkshops(req.user, {
    ...parsed.query,
    mine: req.query.mine === "true",
  });
  res.json({ success: true, data: result.items, meta: pageMeta(parsed.query.page, parsed.query.pageSize, result.total) });
});

export const get = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await workshops.getWorkshop(req.user, req.params.id) });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await workshops.createWorkshop(req.user!, req.body) });
});

export const update = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await workshops.updateWorkshop(req.user!, req.params.id, req.body) });
});

export const remove = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await workshops.deleteWorkshop(req.user!, req.params.id) });
});

function statusHandler(status: "PUBLISHED" | "CANCELLED" | "COMPLETED" | "ARCHIVED") {
  return asyncHandler(async (req: Request, res) => {
    res.json({ success: true, data: await workshops.changeStatus(req.user!, req.params.id, status) });
  });
}

export const publish = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await workshops.publishWorkshop(req.user!, req.params.id) });
});

export const cancel = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await workshops.cancelWorkshop(req.user!, req.params.id) });
});
export const complete = statusHandler("COMPLETED");
export const archive = statusHandler("ARCHIVED");

export const participants = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await registrations.listForWorkshop(req.params.id, req.user!.id, req.user!.role) });
});
