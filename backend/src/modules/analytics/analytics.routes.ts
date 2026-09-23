import { Router } from "express";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { requireRoles } from "../../middleware/rbac.middleware";
import * as controller from "./analytics.controller";

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth, requireVerified);
analyticsRouter.get("/me", controller.me);
analyticsRouter.get("/organizer", requireRoles("ORGANIZER", "ADMIN"), controller.organizer);
analyticsRouter.get("/platform", requireRoles("ADMIN"), controller.platform);
