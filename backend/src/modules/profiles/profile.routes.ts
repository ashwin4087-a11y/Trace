import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as controller from "./profile.controller";

const updateSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(1).optional(),
    lastName: z.string().trim().min(1).optional(),
    preferredLanguage: z.enum(["EN", "TA", "EN_TA"]).optional(),
    institution: z.string().trim().min(2),
    domain: z.enum(["ENGINEERING", "ARTS_SCIENCE", "TAMIL_LANGUAGE", "OTHER"]),
    departmentName: z.string().trim().optional(),
    year: z.number().int().min(1).max(6).optional(),
    interests: z.array(z.string().trim().min(1)).default([]),
    organizationId: z.string().uuid().nullable().optional(),
    departmentId: z.string().uuid().nullable().optional(),
  }),
});

export const profileRouter = Router();

profileRouter.use(requireAuth, requireVerified);
profileRouter.get("/me", controller.me);
profileRouter.put("/me", validate(updateSchema), controller.update);
