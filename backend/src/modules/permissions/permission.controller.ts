import { asyncHandler } from "../../shared/utils/async-handler";
import { listPermissions } from "./permission.service";

export const list = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await listPermissions() });
});
