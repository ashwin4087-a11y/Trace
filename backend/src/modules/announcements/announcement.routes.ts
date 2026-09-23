import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { requireRoles } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as controller from "./announcement.controller";

export const announcementRouter = Router();

announcementRouter.use(requireAuth, requireVerified);
announcementRouter.get("/", controller.list);
announcementRouter.post(
  "/",
  requireRoles("ORGANIZER", "ADMIN"),
  validate(
    z.object({
      body: z.object({
        workshopId: z.string().uuid(),
        title: z.string().min(2),
        body: z.string().min(2),
      }),
    }),
  ),
  controller.create,
);
