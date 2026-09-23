import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { requireRoles } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as controller from "./certificate.controller";

export const certificateRouter = Router();

certificateRouter.get("/verify/:certificateId", controller.verify);
certificateRouter.get("/me", requireAuth, requireVerified, controller.mine);
certificateRouter.get(
  "/workshops/:workshopId",
  requireAuth,
  requireVerified,
  requireRoles("ORGANIZER", "ADMIN"),
  controller.byWorkshop,
);
certificateRouter.post(
  "/workshops/:workshopId/generate",
  requireAuth,
  requireVerified,
  validate(z.object({ body: z.object({ participantId: z.string().uuid().optional() }) })),
  controller.generate,
);
