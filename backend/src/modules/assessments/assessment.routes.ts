import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { requireRoles } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as controller from "./assessment.controller";

export const assessmentRouter = Router();

assessmentRouter.use(requireAuth, requireVerified);
assessmentRouter.get("/", controller.list);
assessmentRouter.post(
  "/",
  requireRoles("ORGANIZER", "ADMIN"),
  validate(
    z.object({
      body: z.object({
        workshopId: z.string().uuid(),
        title: z.string().min(2),
        description: z.string().optional(),
        passScore: z.number().int().min(0).max(100).optional(),
        questions: z.array(
          z.object({
            prompt: z.string().min(2),
            type: z.enum(["MCQ", "SHORT_ANSWER"]),
            options: z.array(z.string()).optional(),
            correctIndex: z.number().int().min(0).optional(),
            points: z.number().int().positive().optional(),
          }),
        ),
      }),
    }),
  ),
  controller.create,
);
assessmentRouter.post(
  "/:id/submissions",
  requireRoles("PARTICIPANT"),
  validate(z.object({ body: z.object({ answers: z.array(z.number().int()) }) })),
  controller.submit,
);
