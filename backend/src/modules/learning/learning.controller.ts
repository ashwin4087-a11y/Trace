import { asyncHandler } from "../../shared/utils/async-handler";
import * as learning from "./learning.service";

export const list = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await learning.listMaterials(String(req.query.workshopId)) });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await learning.addMaterial(req.user!, req.body) });
});

export const remove = asyncHandler(async (req, res) => {
  await learning.removeMaterial(req.user!, req.params.id);
  res.json({ success: true, data: { deleted: true } });
});
