import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { requirePermission, requireRoles } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as controller from "./role.controller";

export const roleRouter = Router();

roleRouter.use(requireAuth, requireVerified, requireRoles("ADMIN"));
roleRouter.get("/", controller.list);
roleRouter.put(
  "/:id/permissions",
  requirePermission("role.write"),
  validate(z.object({ body: z.object({ permissionIds: z.array(z.string().uuid()) }) })),
  controller.updatePermissions,
);
