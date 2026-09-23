import { asyncHandler } from "../../shared/utils/async-handler";
import * as organizations from "./organization.service";

export const list = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await organizations.listOrganizations() });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await organizations.createOrganization(req.user!.id, req.body) });
});

export const update = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await organizations.updateOrganization(req.params.id, req.body) });
});

export const remove = asyncHandler(async (req, res) => {
  await organizations.removeOrganization(req.params.id);
  res.json({ success: true, data: { deleted: true } });
});
