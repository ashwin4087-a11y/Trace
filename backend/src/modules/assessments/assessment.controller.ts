import { asyncHandler } from "../../shared/utils/async-handler";
import * as assessments from "./assessment.service";

export const list = asyncHandler(async (req, res) => {
  const includeAnswers = req.user!.role !== "PARTICIPANT";
  res.json({
    success: true,
    data: await assessments.listAssessments(String(req.query.workshopId), includeAnswers),
  });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await assessments.createAssessment(req.user!, req.body) });
});

export const submit = asyncHandler(async (req, res) => {
  res.status(201).json({
    success: true,
    data: await assessments.submitAssessment(req.user!.id, req.params.id, req.body.answers),
  });
});
