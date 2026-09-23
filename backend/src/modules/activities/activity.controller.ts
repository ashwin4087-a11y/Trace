import { asyncHandler } from "../../shared/utils/async-handler";
import * as activities from "./activity.service";

// Organizer Controllers
export const listOrganizerActivities = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await activities.listOrganizerActivities(req.user!, req.params.workshopId) });
});

export const createActivity = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await activities.createActivity(req.user!, req.body) });
});

export const updateActivity = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await activities.updateActivity(req.user!, req.params.id, req.body) });
});

export const deleteActivity = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await activities.deleteActivity(req.user!, req.params.id) });
});

export const publishActivity = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await activities.publishActivity(req.user!, req.params.id) });
});

export const closeActivity = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await activities.closeActivity(req.user!, req.params.id) });
});

export const reorderActivities = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await activities.reorderActivities(req.user!, req.params.workshopId, req.body.activities) });
});

export const listActivitySubmissions = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await activities.listActivitySubmissions(req.user!, req.params.id) });
});

export const getSubmissionForOrganizer = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await activities.getSubmissionForOrganizer(req.user!, req.params.id) });
});

export const reviewSubmission = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await activities.reviewSubmission(req.user!, req.params.id, req.body) });
});


// Participant Controllers
export const listPublishedActivities = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await activities.listPublishedActivities(req.user!.id, req.params.workshopId) });
});

export const getActivityDetails = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await activities.getActivityDetails(req.user!.id, req.params.id) });
});

export const getParticipantSubmission = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await activities.getParticipantSubmission(req.user!.id, req.params.id) });
});

export const submitActivity = asyncHandler(async (req, res) => {
  res.status(201).json({
    success: true,
    data: await activities.submitActivity(req.user!.id, req.params.id, req.body, req.file),
  });
});
