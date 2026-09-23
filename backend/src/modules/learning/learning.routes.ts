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

// Participant: List published materials for a workshop
learningRouter.get("/workshops/:workshopId", controller.list);

// Organizer: List all materials for a workshop
learningRouter.get("/workshops/:workshopId/manage", requireRoles("ORGANIZER", "ADMIN"), controller.manageList);

// Organizer: Reorder materials
learningRouter.patch(
  "/workshops/:workshopId/reorder",
  requireRoles("ORGANIZER", "ADMIN"),
  validate(
    z.object({
      body: z.object({
        updates: z.array(
          z.object({
            id: z.string().uuid(),
            sortOrder: z.number().min(0),
          })
        ),
      }),
    })
  ),
  controller.reorder
);

// Organizer: Create material
learningRouter.post(
  "/workshops/:workshopId",
  requireRoles("ORGANIZER", "ADMIN"),
  validate(
    z.object({
      body: z.object({
        sessionId: z.string().uuid().nullable().optional(),
        title: z.string().min(1).max(200),
        description: z.string().max(1000).nullable().optional(),
        type: z.enum(["PDF", "PPT", "DOCUMENT", "VIDEO", "URL", "RECORDING", "IMAGE", "OTHER"]),
        url: z.string().min(1).max(1000),
        fileName: z.string().nullable().optional(),
        mimeType: z.string().nullable().optional(),
        fileSize: z.number().min(0).nullable().optional(),
        durationSeconds: z.number().min(0).nullable().optional(),
      }),
    })
  ),
  controller.create
);

// Organizer: Update material
learningRouter.patch(
  "/:id",
  requireRoles("ORGANIZER", "ADMIN"),
  validate(
    z.object({
      body: z.object({
        sessionId: z.string().uuid().nullable().optional(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().max(1000).nullable().optional(),
        type: z.enum(["PDF", "PPT", "DOCUMENT", "VIDEO", "URL", "RECORDING", "IMAGE", "OTHER"]).optional(),
        url: z.string().min(1).max(1000).optional(),
        fileName: z.string().nullable().optional(),
        mimeType: z.string().nullable().optional(),
        fileSize: z.number().min(0).nullable().optional(),
        durationSeconds: z.number().min(0).nullable().optional(),
      }),
    })
  ),
  controller.update
);

// Organizer: Delete material
learningRouter.delete("/:id", requireRoles("ORGANIZER", "ADMIN"), controller.remove);

// Organizer: Publish material
learningRouter.post("/:id/publish", requireRoles("ORGANIZER", "ADMIN"), controller.publish);

// Organizer: Unpublish material
learningRouter.post("/:id/unpublish", requireRoles("ORGANIZER", "ADMIN"), controller.unpublish);

// Participant/Organizer: Access a material (returns url securely)
learningRouter.get("/:id/access", controller.access);
