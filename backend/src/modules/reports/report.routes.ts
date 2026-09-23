import { Router } from "express";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { requirePermission, requireRoles } from "../../middleware/rbac.middleware";
import * as controller from "./report.controller";

export const reportRouter = Router();

reportRouter.get(
  "/:name",
  requireAuth,
  requireVerified,
  requireRoles("ORGANIZER", "ADMIN"),
  requirePermission("report.export"),
  controller.csv,
);
