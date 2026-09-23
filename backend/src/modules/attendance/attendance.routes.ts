import { Router } from "express";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { requirePermission, requireRoles } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as controller from "./attendance.controller";
import { correctSchema, markSchema, qrSchema } from "./attendance.validation";

export const attendanceRouter = Router();

attendanceRouter.use(requireAuth, requireVerified);
attendanceRouter.get("/me", controller.mine);
attendanceRouter.get("/workshops/:workshopId/summary", controller.summary);
attendanceRouter.get("/workshops/:workshopId", requireRoles("ORGANIZER", "ADMIN"), controller.workshop);
attendanceRouter.post("/qr", requireRoles("PARTICIPANT"), validate(qrSchema), controller.qr);
attendanceRouter.post(
  "/",
  requireRoles("ORGANIZER", "ADMIN"),
  requirePermission("attendance.write"),
  validate(markSchema),
  controller.mark,
);
attendanceRouter.patch(
  "/:id",
  requireRoles("ORGANIZER", "ADMIN"),
  requirePermission("attendance.write"),
  validate(correctSchema),
  controller.correct,
);
