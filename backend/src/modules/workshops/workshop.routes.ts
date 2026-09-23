import { Router } from "express";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { requirePermission, requireRoles } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validation.middleware";
import { optionalAuth } from "./workshop.optional-auth";
import * as controller from "./workshop.controller";
import { createWorkshopSchema, updateWorkshopSchema } from "./workshop.validation";

export const workshopRouter = Router();

workshopRouter.get("/", optionalAuth, controller.list);
workshopRouter.get("/:id", optionalAuth, controller.get);
workshopRouter.post(
  "/",
  requireAuth,
  requireVerified,
  requireRoles("ORGANIZER", "ADMIN"),
  requirePermission("workshop.create"),
  validate(createWorkshopSchema),
  controller.create,
);
workshopRouter.patch(
  "/:id",
  requireAuth,
  requireVerified,
  requireRoles("ORGANIZER", "ADMIN"),
  requirePermission("workshop.create"),
  validate(updateWorkshopSchema),
  controller.update,
);
workshopRouter.post(
  "/:id/publish",
  requireAuth,
  requireVerified,
  requireRoles("ORGANIZER", "ADMIN"),
  requirePermission("workshop.publish"),
  controller.publish,
);
workshopRouter.post("/:id/cancel", requireAuth, requireVerified, requireRoles("ORGANIZER", "ADMIN"), controller.cancel);
workshopRouter.post("/:id/complete", requireAuth, requireVerified, requireRoles("ORGANIZER", "ADMIN"), controller.complete);
workshopRouter.post("/:id/archive", requireAuth, requireVerified, requireRoles("ORGANIZER", "ADMIN"), controller.archive);
