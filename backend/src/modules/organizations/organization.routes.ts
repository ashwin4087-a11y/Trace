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

const idSchema = z.object({ params: z.object({ id: z.string().uuid() }) });
const statusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ status: z.enum(["ACTIVE", "SUSPENDED", "DEACTIVATED"]) }),
});

export const organizationRouter = Router();

organizationRouter.use(requireAuth, requireVerified);
organizationRouter.get("/", requireRoles("ADMIN"), requirePermission("organization.read"), controller.list);
organizationRouter.get("/:id", requireRoles("ADMIN"), requirePermission("organization.read"), validate(idSchema), controller.get);
organizationRouter.post("/", requireRoles("ADMIN"), requirePermission("organization.write"), validate(writeSchema), controller.create);
organizationRouter.patch("/:id", requireRoles("ADMIN"), requirePermission("organization.write"), validate(z.object({ params: z.object({ id: z.string().uuid() }), body: writeSchema.shape.body.partial() })), controller.update);
organizationRouter.patch("/:id/status", requireRoles("ADMIN"), requirePermission("organization.write"), validate(statusSchema), controller.status);
organizationRouter.delete("/:id", requireRoles("ADMIN"), requirePermission("organization.write"), controller.remove);
