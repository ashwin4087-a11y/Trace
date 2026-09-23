import { Router } from "express";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { requireRoles } from "../../middleware/rbac.middleware";
import * as controller from "./permission.controller";

export const permissionRouter = Router();

permissionRouter.use(requireAuth, requireVerified, requireRoles("ADMIN"));
permissionRouter.get("/", controller.list);
