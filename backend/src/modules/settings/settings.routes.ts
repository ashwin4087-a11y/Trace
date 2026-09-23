import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { requirePermission, requireRoles } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as controller from "./settings.controller";

const updateSchema = z.object({
  body: z.object({
    platformName: z.string().min(2).optional(),
    defaultLanguage: z.enum(["EN", "TA", "EN_TA"]).optional(),
    supportedLanguages: z.array(z.enum(["EN", "TA", "EN_TA"])).optional(),
    timezone: z.string().min(2).optional(),
    registrationOpen: z.boolean().optional(),
    certificateMinPercent: z.number().int().min(1).max(100).optional(),
    notificationsEnabled: z.boolean().optional(),
    maintenanceMode: z.boolean().optional(),
  }),
});

export const settingsRouter = Router();

settingsRouter.get("/", controller.get);
settingsRouter.patch(
  "/",
  requireAuth,
  requireVerified,
  requireRoles("ADMIN"),
  requirePermission("settings.write"),
  validate(updateSchema),
  controller.update,
);
