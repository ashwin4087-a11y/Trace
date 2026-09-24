import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { requirePermission, requireRoles } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as controller from "./session.controller";

const sessionSchemaBase = {
  title: z.string().min(2),
  description: z.string().optional(),
  sessionDate: z.string().datetime(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  mode: z.enum(["ONLINE", "OFFLINE", "HYBRID"]),
  meetingProvider: z.string().optional(),
  meetingUrl: z.string().url().optional(),
  venue: z.string().optional(),
  recordingUrl: z.string().url().optional(),
  trainerName: z.string().optional(),
};

const createSchema = z.object({
  body: z.object({
    workshopId: z.string().uuid(),
    ...sessionSchemaBase,
  }).refine((data) => {
    if (["OFFLINE", "HYBRID"].includes(data.mode)) {
      if (!data.venue) return false;
    }
    return true;
  }, {
    message: "Venue is required for OFFLINE or HYBRID sessions",
    path: ["venue"],
  })
});

const updateSchema = z.object({
  body: z.object(sessionSchemaBase).partial().extend({
    status: z.enum(["SCHEDULED", "LIVE", "COMPLETED", "CANCELLED"]).optional(),
  })
});

export const sessionRouter = Router();

sessionRouter.use(requireAuth, requireVerified);
sessionRouter.get("/", controller.list);
sessionRouter.get("/:id/access", controller.access);
sessionRouter.post(
  "/",
  requireRoles("ORGANIZER", "ADMIN"),
  requirePermission("workshop.create"),
  validate(createSchema),
  controller.create,
);
sessionRouter.patch("/:id", requireRoles("ORGANIZER", "ADMIN"), requirePermission("workshop.create"), validate(updateSchema), controller.update);
sessionRouter.delete("/:id", requireRoles("ORGANIZER", "ADMIN"), requirePermission("workshop.create"), controller.remove);
sessionRouter.post("/:id/qr", requireRoles("ORGANIZER", "ADMIN"), requirePermission("attendance.write"), controller.qr);
sessionRouter.post("/:id/meeting/start", requireRoles("ORGANIZER", "ADMIN"), requirePermission("attendance.write"), controller.meetingStart);
sessionRouter.post("/:id/meeting/end", requireRoles("ORGANIZER", "ADMIN"), requirePermission("attendance.write"), controller.meetingEnd);
sessionRouter.post("/:id/end", requireRoles("ORGANIZER", "ADMIN"), requirePermission("attendance.write"), controller.end);
