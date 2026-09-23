import { asyncHandler } from "../../shared/utils/async-handler";
import * as learning from "./learning.service";

export const list = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await learning.listMaterialsForParticipant(req.user, req.params.workshopId) });
});

export const manageList = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await learning.manageList(req.user!, req.params.workshopId) });
});

export const reorder = asyncHandler(async (req, res) => {
  await learning.reorderMaterials(req.user!, req.params.workshopId, req.body.updates);
  res.json({ success: true, data: { reordered: true } });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await learning.addMaterial(req.user!, req.params.workshopId, req.body) });
});

export const update = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await learning.updateMaterial(req.user!, req.params.id, req.body) });
});

export const remove = asyncHandler(async (req, res) => {
  await learning.removeMaterial(req.user!, req.params.id);
  res.json({ success: true, data: { deleted: true } });
});

export const publish = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await learning.publishMaterial(req.user!, req.params.id) });
});

export const unpublish = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await learning.unpublishMaterial(req.user!, req.params.id) });
});

export const access = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await learning.getMaterialAccess(req.user, req.params.id) });
});
