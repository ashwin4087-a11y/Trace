import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { requirePermission, requireRoles } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as controller from "./organization.controller";

const writeSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    code: z.string().trim().min(2).max(20),
    description: z.string().optional(),
  }),
});

export const organizationRouter = Router();

organizationRouter.use(requireAuth, requireVerified);
organizationRouter.get("/", controller.list);
organizationRouter.post("/", requireRoles("ADMIN"), requirePermission("organization.write"), validate(writeSchema), controller.create);
organizationRouter.patch("/:id", requireRoles("ADMIN"), requirePermission("organization.write"), controller.update);
organizationRouter.delete("/:id", requireRoles("ADMIN"), requirePermission("organization.write"), controller.remove);
