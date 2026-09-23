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

export const departmentRouter = Router();

departmentRouter.use(requireAuth, requireVerified);
departmentRouter.get("/", controller.list);
departmentRouter.post("/", requireRoles("ADMIN"), requirePermission("organization.write"), validate(writeSchema), controller.create);
departmentRouter.patch("/:id", requireRoles("ADMIN"), requirePermission("organization.write"), controller.update);
departmentRouter.delete("/:id", requireRoles("ADMIN"), requirePermission("organization.write"), controller.remove);
