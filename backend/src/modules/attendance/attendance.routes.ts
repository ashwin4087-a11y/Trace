import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as attendance from "./attendance.controller";
import * as schemas from "./attendance.validation";

const router = Router();

router.use(requireAuth);

// Organizer routes
router.get("/workshops/:workshopId/attendance", attendance.workshop);
router.get("/sessions/:sessionId/attendance", attendance.getSessionAttendance);
router.post("/sessions/:sessionId/attendance/initialize", attendance.initialize);
router.post("/sessions/:sessionId/attendance/bulk", validate(schemas.bulkMarkSchema), attendance.bulkMark);
router.post("/attendance", validate(schemas.markSchema), attendance.mark);
router.patch("/attendance/:id", validate(schemas.correctSchema), attendance.correct);

router.post("/sessions/:sessionId/attendance/qr/generate", attendance.generateQr);
router.post("/sessions/:sessionId/attendance/qr/close", attendance.closeQr);

// Participant routes
router.post("/qr", validate(schemas.qrSchema), attendance.qr);
router.get("/workshops/:workshopId/attendance/summary", attendance.summary);
router.get("/attendance/me", attendance.mine);

export { router as attendanceRoutes };
