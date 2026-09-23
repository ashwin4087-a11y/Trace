import { Router } from "express";
import multer from "multer";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { requireRoles } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as controller from "./activity.controller";
import * as schemas from "./activity.validation";

const upload = multer({ 
  dest: "public/uploads/", 
  limits: { fileSize: 10 * 1024 * 1024 } 
});

export const activityRouter = Router();

activityRouter.use(requireAuth, requireVerified);

// Participant routes
activityRouter.get("/workshops/:workshopId", controller.listPublishedActivities);
activityRouter.get("/:id", controller.getActivityDetails);
activityRouter.get("/:id/submission", controller.getParticipantSubmission);
activityRouter.post(
  "/:id/submission",
  upload.single("file"),
  validate(schemas.submitActivitySchema),
  controller.submitActivity
);

// Organizer Routes
const organizerRouter = Router();
organizerRouter.use(requireRoles("ORGANIZER", "ADMIN"));

organizerRouter.get("/workshops/:workshopId/manage", controller.listOrganizerActivities);
organizerRouter.post("/workshops/:workshopId", validate(schemas.createActivitySchema), controller.createActivity);
organizerRouter.patch("/workshops/:workshopId/reorder", validate(schemas.reorderActivitiesSchema), controller.reorderActivities);
organizerRouter.patch("/:id", validate(schemas.updateActivitySchema), controller.updateActivity);
organizerRouter.delete("/:id", controller.deleteActivity);
organizerRouter.post("/:id/publish", controller.publishActivity);
organizerRouter.post("/:id/close", controller.closeActivity);

organizerRouter.get("/:id/submissions", controller.listActivitySubmissions);
organizerRouter.get("/submissions/:id", controller.getSubmissionForOrganizer);
organizerRouter.post("/submissions/:id/review", validate(schemas.reviewSubmissionSchema), controller.reviewSubmission);

activityRouter.use(organizerRouter);
