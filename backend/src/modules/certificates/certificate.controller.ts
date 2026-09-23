import { asyncHandler } from "../../shared/utils/async-handler";
import { ApiError } from "../../shared/errors/api-error";
import * as certificates from "./certificate.service";

export const generate = asyncHandler(async (req, res) => {
  const participantId = req.user!.role === "PARTICIPANT" ? req.user!.id : req.body.participantId;
  if (!participantId) {
    throw new ApiError(400, "VALIDATION_ERROR", "participantId is required");
  }
  res.status(201).json({
    success: true,
    data: await certificates.generateForParticipant(req.user!, req.params.workshopId, participantId),
  });
});

export const evaluateEligibility = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: await certificates.evaluateEligibility(req.params.workshopId, req.params.registrationId),
  });
});

export const mine = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await certificates.listMine(req.user!.id) });
});

export const byWorkshop = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await certificates.listForWorkshop(req.params.workshopId) });
});

export const verify = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await certificates.verify(req.params.certificateId) });
});
