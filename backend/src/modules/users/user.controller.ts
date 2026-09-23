import { asyncHandler } from "../../shared/utils/async-handler";
import { pageMeta } from "../../shared/utils/pagination";
import * as users from "./user.service";

export const list = asyncHandler(async (req, res) => {
  const query = req.query as unknown as {
    page: number;
    pageSize: number;
    search?: string;
    role?: "ADMIN" | "ORGANIZER" | "PARTICIPANT";
    status?: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED";
    organizationId?: string;
    departmentId?: string;
  };
  const page = Number(query.page ?? 1);
  const pageSize = Number(query.pageSize ?? 20);
  const result = await users.listUsers({
    page,
    pageSize,
    search: query.search,
    role: query.role,
    status: query.status,
    organizationId: query.organizationId,
    departmentId: query.departmentId,
  });
  res.json({ success: true, data: result.items, meta: pageMeta(page, pageSize, result.total) });
});

export const get = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await users.getUser(req.params.id) });
});

export const update = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await users.updateUser(req.user!.id, req.params.id, req.body) });
});

export const status = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await users.setStatus(req.user!.id, req.params.id, req.body.status) });
});

export const role = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await users.assignRole(req.user!.id, req.params.id, req.body.role) });
});

export const createOrganizer = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await users.createOrganizer(req.user!.id, req.body) });
});

