import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as controller from "./profile.controller";

const updateSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(160).nullable().optional(),
    phone: z.string().trim().min(7).max(30).nullable().optional(),
    firstName: z.string().trim().min(1).optional(),
    lastName: z.string().trim().min(1).optional(),
    preferredLanguage: z.enum(["EN", "TA", "EN_TA"]).optional(),
    institution: z.string().trim().min(2),
    domain: z.enum(["ENGINEERING", "ARTS_SCIENCE", "TAMIL_LANGUAGE", "INTERDISCIPLINARY", "OTHER"]),
    departmentName: z.string().trim().optional(),
    year: z.enum(["FIRST", "SECOND", "THIRD", "FOURTH", "POSTGRADUATE", "WORKING_PROFESSIONAL", "OTHER"]).optional(),
    interests: z.array(z.string().trim().min(1)).default([]),
    skills: z.array(z.string().trim().min(2)).default([]),
    academicPreferredLanguage: z.enum(["ENGLISH", "TAMIL", "TAMIL_ENGLISH"]).optional(),
    organizationId: z.string().uuid().nullable().optional(),
    departmentId: z.string().uuid().nullable().optional(),
  }),
});

export const profileRouter = Router();

profileRouter.use(requireAuth, requireVerified);
profileRouter.get("/options", controller.options);
profileRouter.get("/me", controller.me);
profileRouter.put("/me", validate(updateSchema), controller.update);
profileRouter.post("/me", validate(updateSchema), controller.update);
profileRouter.patch("/me", validate(updateSchema), controller.update);
