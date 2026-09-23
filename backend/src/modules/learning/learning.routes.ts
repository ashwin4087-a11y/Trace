import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireVerified } from "../../middleware/auth.middleware";
import { upload, uploadedPublicPath } from "../../middleware/upload.middleware";
import { storeUploadedFile } from "../../integrations/storage/storage.provider";
import { requireRoles } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validation.middleware";
import * as controller from "./learning.controller";

export const learningRouter = Router();

learningRouter.use(requireAuth, requireVerified);
learningRouter.get("/", controller.list);
learningRouter.post("/upload", requireRoles("ORGANIZER", "ADMIN"), upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: { code: "INVALID_FILE", message: "Choose a file" } });
      return;
    }
    const stored = await storeUploadedFile(uploadedPublicPath(req.file.filename));
    res.status(201).json({ success: true, data: stored });
  } catch (error) {
    next(error);
  }
});
learningRouter.post(
  "/",
  requireRoles("ORGANIZER", "ADMIN"),
  validate(
    z.object({
      body: z.object({
        workshopId: z.string().uuid(),
        sessionId: z.string().uuid().optional(),
        title: z.string().min(2),
        type: z.enum(["PDF", "PPT", "DOCUMENT", "VIDEO", "URL", "RECORDING"]),
        url: z.string().min(1),
      }),
    }),
  ),
  controller.create,
);
learningRouter.delete("/:id", requireRoles("ORGANIZER", "ADMIN"), controller.remove);
