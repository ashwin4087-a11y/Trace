import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { requirePermission, requireRoles } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as controller from "./registration.controller";

export const registrationRouter = Router();

registrationRouter.use(requireAuth, requireVerified);
registrationRouter.post(
  "/",
  requireRoles("PARTICIPANT"),
  validate(z.object({ body: z.object({ workshopId: z.string().uuid() }) })),
  controller.create,
);
registrationRouter.get("/me", controller.mine);
registrationRouter.get("/:id", controller.getById);
registrationRouter.get(
  "/",
  requireRoles("ORGANIZER", "ADMIN"),
  requirePermission("registration.manage"),
  controller.byWorkshop,
);
registrationRouter.delete("/:id", controller.cancel);
