import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { localUploadDir } from "../config/storage";
import { ApiError } from "../shared/errors/api-error";

const allowed = new Set([
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "video/mp4",
  "image/png",
  "image/jpeg",
]);

fs.mkdirSync(localUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, localUploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowed.has(file.mimetype)) {
      cb(new ApiError(400, "INVALID_FILE", "File type is not allowed"));
      return;
    }
    cb(null, true);
  },
});

export function uploadedPublicPath(filename: string): string {
  return `/uploads/${path.basename(filename)}`;
}
