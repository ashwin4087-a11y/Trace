import { Request, Response } from "express";
import * as assessments from "./assessment.service";

// ============================================================================
// Organizer Actions
// ============================================================================

export async function manageList(req: Request, res: Response) {
  res.json({ success: true, data: await assessments.listOrganizerAssessments(req.user!, req.params.workshopId) });
}

export async function create(req: Request, res: Response) {
  res.status(201).json({ success: true, data: await assessments.createAssessment(req.user!, { ...req.body, workshopId: req.params.workshopId }) });
}

export async function get(req: Request, res: Response) {
  res.json({ success: true, data: await assessments.getAssessmentById(req.user!, req.params.id) });
}

export async function update(req: Request, res: Response) {
  res.json({ success: true, data: await assessments.updateAssessment(req.user!, req.params.id, req.body) });
}

export async function destroy(req: Request, res: Response) {
  await assessments.deleteAssessment(req.user!, req.params.id);
  res.json({ success: true });
}

export async function publish(req: Request, res: Response) {
  res.json({ success: true, data: await assessments.publishAssessment(req.user!, req.params.id) });
}

export async function close(req: Request, res: Response) {
  res.json({ success: true, data: await assessments.closeAssessment(req.user!, req.params.id) });
}

export async function getResults(req: Request, res: Response) {
  res.json({ success: true, data: await assessments.getAssessmentResults(req.user!, req.params.id) });
}

// Questions

export async function addQuestion(req: Request, res: Response) {
  res.status(201).json({ success: true, data: await assessments.addQuestion(req.user!, req.params.id, req.body) });
}

export async function updateQuestion(req: Request, res: Response) {
  res.json({ success: true, data: await assessments.updateQuestion(req.user!, req.params.id, req.body) });
}

export async function deleteQuestion(req: Request, res: Response) {
  await assessments.deleteQuestion(req.user!, req.params.id);
  res.json({ success: true });
}

export async function reorderQuestions(req: Request, res: Response) {
  await assessments.reorderQuestions(req.user!, req.params.id, req.body.questionIds);
  res.json({ success: true });
}

// ============================================================================
// Participant Actions
// ============================================================================

export async function participantList(req: Request, res: Response) {
  res.json({ success: true, data: await assessments.listParticipantAssessments(req.user!.id, req.params.workshopId) });
}

export async function participantGet(req: Request, res: Response) {
  res.json({ success: true, data: await assessments.getParticipantAssessment(req.user!.id, req.params.id) });
}

export async function startAttempt(req: Request, res: Response) {
  res.status(201).json({ success: true, data: await assessments.startAttempt(req.user!.id, req.params.id) });
}

export async function submitAttempt(req: Request, res: Response) {
  res.json({ success: true, data: await assessments.submitAttempt(req.user!.id, req.params.id, req.body) });
}

export async function getAttemptResult(req: Request, res: Response) {
  res.json({ success: true, data: await assessments.getAttemptResult(req.user!.id, req.params.id) });
}
