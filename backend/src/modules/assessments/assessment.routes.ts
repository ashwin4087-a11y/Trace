import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { requireRoles } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as controller from "./assessment.controller";
import { CreateAssessmentSchema, UpdateAssessmentSchema, CreateQuestionSchema, UpdateQuestionSchema, SubmitAttemptSchema } from "./assessment.validation";

export const assessmentRouter = Router();

assessmentRouter.use(requireAuth, requireVerified);

// --- ORGANIZER ENDPOINTS ---
const requireOrganizer = requireRoles("ORGANIZER", "ADMIN");

// Workshop-level assessment operations
assessmentRouter.get("/workshops/:workshopId/assessments/manage", requireOrganizer, controller.manageList);
assessmentRouter.post("/workshops/:workshopId/assessments", requireOrganizer, validate(CreateAssessmentSchema), controller.create);

// Assessment operations
assessmentRouter.get("/assessments/:id", requireOrganizer, controller.get);
assessmentRouter.patch("/assessments/:id", requireOrganizer, validate(UpdateAssessmentSchema), controller.update);
assessmentRouter.delete("/assessments/:id", requireOrganizer, controller.destroy);
assessmentRouter.post("/assessments/:id/publish", requireOrganizer, controller.publish);
assessmentRouter.post("/assessments/:id/close", requireOrganizer, controller.close);
assessmentRouter.get("/assessments/:id/results", requireOrganizer, controller.getResults);

// Question operations
assessmentRouter.post("/assessments/:id/questions", requireOrganizer, validate(CreateQuestionSchema), controller.addQuestion);
assessmentRouter.patch("/assessments/:id/questions/reorder", requireOrganizer, validate(z.object({ body: z.object({ questionIds: z.array(z.string().uuid()) }) })), controller.reorderQuestions);
assessmentRouter.patch("/assessment-questions/:id", requireOrganizer, validate(UpdateQuestionSchema), controller.updateQuestion);
assessmentRouter.delete("/assessment-questions/:id", requireOrganizer, controller.deleteQuestion);

// --- PARTICIPANT ENDPOINTS ---
const requireParticipant = requireRoles("PARTICIPANT");

// Workshop-level assessment discovery
assessmentRouter.get("/workshops/:workshopId/assessments", requireParticipant, controller.participantList);

// Assessment operations
assessmentRouter.get("/assessments/:id/participant", requireParticipant, controller.participantGet);
assessmentRouter.post("/assessments/:id/attempts", requireParticipant, controller.startAttempt);

// Attempt operations
assessmentRouter.post("/assessment-attempts/:id/submit", requireParticipant, validate(SubmitAttemptSchema), controller.submitAttempt);
assessmentRouter.get("/assessment-attempts/:id/result", requireParticipant, controller.getAttemptResult);
