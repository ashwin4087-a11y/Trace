import { asyncHandler } from "../../shared/utils/async-handler";
import { pageMeta } from "../../shared/utils/pagination";
import * as organizers from "./organizer.service";

export const list = asyncHandler(async (req, res) => {
  const query = req.query as unknown as { page: number; pageSize: number; search?: string; status?: "ACTIVE" | "SUSPENDED" | "DEACTIVATED"; organizationId?: string; departmentId?: string };
  const page = Number(query.page ?? 1);
  const pageSize = Number(query.pageSize ?? 20);
  const result = await organizers.listOrganizers({ page, pageSize, search: query.search, status: query.status, organizationId: query.organizationId, departmentId: query.departmentId });
  res.json({ success: true, data: result.items, meta: pageMeta(page, pageSize, result.total) });
});

export const get = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await organizers.getOrganizer(req.params.id) });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await organizers.createOrganizer(req.user!.id, req.body) });
});

export const update = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await organizers.updateOrganizer(req.user!.id, req.params.id, req.body) });
});

export const status = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await organizers.setOrganizerStatus(req.user!.id, req.params.id, req.body.status) });
});
