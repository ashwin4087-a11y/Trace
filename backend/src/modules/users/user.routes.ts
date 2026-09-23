import { Router } from "express";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { requirePermission, requireRoles } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as controller from "./user.controller";
import { createOrganizerSchema, listUsersSchema, statusSchema, updateUserSchema } from "./user.validation";

export const userRouter = Router();

userRouter.use(requireAuth, requireVerified);
userRouter.get("/", requireRoles("ADMIN"), requirePermission("user.read"), validate(listUsersSchema), controller.list);
userRouter.post(
  "/organizers",
  requireRoles("ADMIN"),
  requirePermission("organizer.create"),
  validate(createOrganizerSchema),
  controller.createOrganizer,
);
userRouter.get("/:id", requireRoles("ADMIN"), requirePermission("user.read"), controller.get);
userRouter.patch(
  "/:id",
  requireRoles("ADMIN"),
  requirePermission("user.write"),
  validate(updateUserSchema),
  controller.update,
);
userRouter.patch(
  "/:id/status",
  requireRoles("ADMIN"),
  requirePermission("user.suspend"),
  validate(statusSchema),
  controller.status,
);
