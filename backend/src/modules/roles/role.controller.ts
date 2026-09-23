import { asyncHandler } from "../../shared/utils/async-handler";
import * as roles from "./role.service";

export const list = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await roles.listRoles() });
});

export const updatePermissions = asyncHandler(async (req, res) => {
  const data = await roles.setRolePermissions(req.user!.id, req.params.id, req.body.permissionIds);
  res.json({ success: true, data });
});
