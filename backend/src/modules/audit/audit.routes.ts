import { Router } from "express";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { requirePermission, requireRoles } from "../../middleware/rbac.middleware";
import * as controller from "./audit.controller";

export const auditRouter = Router();

auditRouter.use(requireAuth, requireVerified, requireRoles("ADMIN"), requirePermission("audit.read"));
auditRouter.get("/", controller.list);
