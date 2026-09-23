import { Router } from "express";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { requirePermission, requireRoles } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as controller from "./organizer.controller";
import { createSchema, idSchema, listSchema, statusSchema, updateSchema } from "./organizer.validation";

export const organizerRouter = Router();

organizerRouter.use(requireAuth, requireVerified, requireRoles("ADMIN"));
organizerRouter.get("/", requirePermission("organizer.read"), validate(listSchema), controller.list);
organizerRouter.get("/:id", requirePermission("organizer.read"), validate(idSchema), controller.get);
organizerRouter.post("/", requirePermission("organizer.create"), validate(createSchema), controller.create);
organizerRouter.patch("/:id", requirePermission("organizer.write"), validate(updateSchema), controller.update);
organizerRouter.patch("/:id/status", requirePermission("organizer.write"), validate(statusSchema), controller.status);
