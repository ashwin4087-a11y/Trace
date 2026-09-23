import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { requireRoles } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as controller from "./activity.controller";

export const activityRouter = Router();

activityRouter.use(requireAuth, requireVerified);
activityRouter.get("/", controller.list);
activityRouter.post(
  "/",
  requireRoles("ORGANIZER", "ADMIN"),
  validate(
    z.object({
      body: z.object({
        workshopId: z.string().uuid(),
        title: z.string().min(2),
        description: z.string().min(2),
        type: z.enum(["ASSIGNMENT", "PRACTICAL", "SURVEY", "TASK"]),
        dueAt: z.string().datetime().optional(),
      }),
    }),
  ),
  controller.create,
);
activityRouter.post(
  "/:id/submissions",
  requireRoles("PARTICIPANT"),
  validate(z.object({ body: z.object({ content: z.string().min(1) }) })),
  controller.submit,
);
