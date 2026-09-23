import type { Request } from "express";
import { asyncHandler } from "../../shared/utils/async-handler";
import { pageMeta } from "../../shared/utils/pagination";
import * as workshops from "./workshop.service";

export const list = asyncHandler(async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 20);
  const result = await workshops.listWorkshops(req.user, {
    page,
    pageSize,
    search: typeof req.query.search === "string" ? req.query.search : undefined,
    domain: typeof req.query.domain === "string" ? req.query.domain : undefined,
    language: typeof req.query.language === "string" ? req.query.language : undefined,
    status: typeof req.query.status === "string" ? (req.query.status as never) : undefined,
  });
  res.json({ success: true, data: result.items, meta: pageMeta(page, pageSize, result.total) });
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

function statusHandler(status: "PUBLISHED" | "CANCELLED" | "COMPLETED" | "ARCHIVED") {
  return asyncHandler(async (req: Request, res) => {
    res.json({ success: true, data: await workshops.changeStatus(req.user!, req.params.id, status) });
  });
}

export const publish = statusHandler("PUBLISHED");
export const cancel = statusHandler("CANCELLED");
export const complete = statusHandler("COMPLETED");
export const archive = statusHandler("ARCHIVED");
