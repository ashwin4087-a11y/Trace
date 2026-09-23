import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { requireRoles } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as controller from "./learning-path.controller";

export const learningPathRouter = Router();

learningPathRouter.get("/", controller.list);
learningPathRouter.get("/me", requireAuth, requireVerified, controller.mine);
learningPathRouter.post("/:id/enroll", requireAuth, requireVerified, controller.enroll);
learningPathRouter.post(
  "/",
  requireAuth,
  requireVerified,
  requireRoles("ADMIN", "ORGANIZER"),
  validate(
    z.object({
      body: z.object({
        title: z.string().min(3),
        description: z.string().min(3),
        domain: z.enum(["ENGINEERING", "ARTS_SCIENCE", "TAMIL_LANGUAGE", "OTHER"]).optional(),
        workshopIds: z.array(z.string().uuid()).min(1),
      }),
    }),
  ),
  controller.create,
);
