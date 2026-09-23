import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as controller from "./skill.controller";

export const skillRouter = Router();

skillRouter.get("/", controller.list);
skillRouter.get("/me", requireAuth, requireVerified, controller.me);
skillRouter.post(
  "/me",
  requireAuth,
  requireVerified,
  validate(
    z.object({
      body: z.object({
        name: z.string().min(2),
        level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
      }),
    }),
  ),
  controller.add,
);
