import { asyncHandler } from "../../shared/utils/async-handler";
import * as departments from "./department.service";

export const list = asyncHandler(async (req, res) => {
  const organizationId = typeof req.query.organizationId === "string" ? req.query.organizationId : undefined;
  res.json({ success: true, data: await departments.listDepartments(organizationId) });
});

export const get = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await departments.getDepartment(req.params.id) });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await departments.createDepartment(req.user!.id, req.body) });
});

export const update = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await departments.updateDepartment(req.user!.id, req.params.id, req.body) });
});

export const status = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await departments.getDepartment(req.params.id) });
});

export const remove = asyncHandler(async (req, res) => {
  await departments.removeDepartment(req.params.id);
  res.json({ success: true, data: { deleted: true } });
});
