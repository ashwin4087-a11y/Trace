import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { requirePermission, requireRoles } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as controller from "./session.controller";

const createSchema = z.object({
  body: z.object({
    workshopId: z.string().uuid(),
    title: z.string().min(2),
    sessionDate: z.string().datetime(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    trainerId: z.string().uuid().optional(),
    trainerName: z.string().optional(),
    meetingUrl: z.string().url().optional(),
    venue: z.string().optional(),
  }),
});

export const sessionRouter = Router();

sessionRouter.use(requireAuth, requireVerified);
sessionRouter.get("/", controller.list);
sessionRouter.post(
  "/",
  requireRoles("ORGANIZER", "ADMIN"),
  requirePermission("workshop.create"),
  validate(createSchema),
  controller.create,
);
sessionRouter.patch("/:id", requireRoles("ORGANIZER", "ADMIN"), requirePermission("workshop.create"), controller.update);
sessionRouter.post("/:id/qr", requireRoles("ORGANIZER", "ADMIN"), requirePermission("attendance.write"), controller.qr);
