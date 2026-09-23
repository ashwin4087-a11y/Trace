import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as controller from "./notification.controller";

export const notificationRouter = Router();

notificationRouter.post("/test-email", requireAuth, controller.testEmail);

notificationRouter.use(requireAuth, requireVerified);
notificationRouter.get("/", controller.list);
notificationRouter.post("/read-all", controller.readAll);
notificationRouter.post("/:id/read", controller.read);
notificationRouter.get("/preferences", controller.preferences);
notificationRouter.put(
  "/preferences",
  validate(
    z.object({
      body: z.object({
        emailEnabled: z.boolean().optional(),
        inAppEnabled: z.boolean().optional(),
        workshopAlerts: z.boolean().optional(),
        sessionReminders: z.boolean().optional(),
        certificateAlerts: z.boolean().optional(),
      }),
    }),
  ),
  controller.updatePreferences,
);
