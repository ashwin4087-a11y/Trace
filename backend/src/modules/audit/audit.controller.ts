import { asyncHandler } from "../../shared/utils/async-handler";
import { pageMeta } from "../../shared/utils/pagination";
import { listAudit } from "./audit.service";

export const list = asyncHandler(async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 20);
  const action = typeof req.query.action === "string" ? req.query.action : undefined;
  const result = await listAudit(page, pageSize, action);
  res.json({ success: true, data: result.items, meta: pageMeta(page, pageSize, result.total) });
});
