import { prisma } from "../../config/database";
import { ApiError } from "../../shared/errors/api-error";
import { isCertificateEligible } from "../../shared/utils/attendance";
import { summarize } from "../attendance/attendance.service";
import { getSettings } from "../settings/settings.service";

export async function evaluateCertificateEligibility(workshopId: string, registrationId: string) {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { user: true },
  });

  if (!registration || registration.workshopId !== workshopId) {
    throw new ApiError(404, "NOT_FOUND", "Registration not found");
  }

  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
  });

  if (!workshop) {
    throw new ApiError(404, "NOT_FOUND", "Workshop not found");
  }

  const reasons: string[] = [];

  // 1. Workshop completion requirement
  const completionRequirementMet = workshop.status === "COMPLETED" || workshop.status === "PUBLISHED" || workshop.status === "ONGOING";
  if (!completionRequirementMet) {
    reasons.push("Workshop is not yet completed or published");
  }

  // 2. Attendance requirement
  const summary = await summarize(registration.userId, workshopId);
  const settings = await getSettings();
  const requiredAttendancePercentage = settings.certificateMinPercent;
  const attendanceRequirementMet = isCertificateEligible(summary.percentage, requiredAttendancePercentage);
  
  if (!attendanceRequirementMet) {
    reasons.push(`Attendance is ${summary.percentage.toFixed(1)}%. At least ${requiredAttendancePercentage}% is required.`);
  }

  // 3. Assessment requirement
  const requiredAssessments = await prisma.assessment.findMany({
    where: { workshopId, isRequired: true, status: "PUBLISHED" },
  });
  
  let assessmentRequirementMet = true;
  for (const assessment of requiredAssessments) {
    const passedAttempt = await prisma.assessmentAttempt.findFirst({
      where: { 
        assessmentId: assessment.id, 
        userId: registration.userId,
        passed: true 
      }
    });
    if (!passedAttempt) {
      assessmentRequirementMet = false;
      reasons.push(`Required assessment '${assessment.title}' not passed.`);
    }
  }

  // 4. Activity requirement
  const requiredActivities = await prisma.activity.findMany({
    where: { workshopId, isRequired: true, status: "PUBLISHED" },
  });

  let activityRequirementMet = true;
  for (const activity of requiredActivities) {
    const submission = await prisma.activitySubmission.findFirst({
      where: {
        activityId: activity.id,
        userId: registration.userId,
        status: { in: ["SUBMITTED", "UNDER_REVIEW", "COMPLETED", "LATE"] }
      }
    });
    if (!submission) {
      activityRequirementMet = false;
      reasons.push(`Required activity '${activity.title}' not completed.`);
    }
  }

  const eligible = completionRequirementMet && attendanceRequirementMet && assessmentRequirementMet && activityRequirementMet;

  return {
    eligible,
    attendancePercentage: summary.percentage,
    requiredAttendancePercentage,
    attendanceRequirementMet,
    assessmentRequirementMet,
    activityRequirementMet,
    completionRequirementMet,
    reasons,
  };
}
