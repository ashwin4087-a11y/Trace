import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { requirePermission, requireRoles } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as controller from "./department.controller";

const writeSchema = z.object({
  body: z.object({
    organizationId: z.string().uuid(),
    name: z.string().trim().min(2),
    code: z.string().trim().min(2).max(20),
  }),
});
const idSchema = z.object({ params: z.object({ id: z.string().uuid() }) });
const listSchema = z.object({ query: z.object({ organizationId: z.string().uuid().optional() }) });
const statusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ status: z.enum(["ACTIVE", "SUSPENDED", "DEACTIVATED"]) }),
});

export const departmentRouter = Router();

departmentRouter.use(requireAuth, requireVerified);
departmentRouter.get("/", requireRoles("ADMIN"), requirePermission("department.read"), validate(listSchema), controller.list);
departmentRouter.get("/:id", requireRoles("ADMIN"), requirePermission("department.read"), validate(idSchema), controller.get);
departmentRouter.post("/", requireRoles("ADMIN"), requirePermission("organization.write"), validate(writeSchema), controller.create);
departmentRouter.patch("/:id", requireRoles("ADMIN"), requirePermission("organization.write"), validate(z.object({ params: z.object({ id: z.string().uuid() }), body: writeSchema.shape.body.omit({ organizationId: true }).partial() })), controller.update);
departmentRouter.patch("/:id/status", requireRoles("ADMIN"), requirePermission("organization.write"), validate(statusSchema), controller.status);
departmentRouter.delete("/:id", requireRoles("ADMIN"), requirePermission("organization.write"), controller.remove);
