import { prisma } from "../../config/database";
import { ApiError } from "../../shared/errors/api-error";
import type { AuthUser } from "../../shared/types/http";
import { isCertificateEligible } from "../../shared/utils/attendance";
import { randomToken } from "../../shared/utils/tokens";
import { summarize } from "../attendance/attendance.service";
import { recordAudit } from "../audit/audit.service";
import { emitWorkshopDomainEvent } from "../workshops/workshop.events";
import { getSettings } from "../settings/settings.service";
import { assertCanManageWorkshop } from "../workshops/workshop.service";
import { writeCertificatePdf } from "./certificate.generator";
import { evaluateCertificateEligibility } from "./eligibility.service";

export const evaluateEligibility = evaluateCertificateEligibility;

export async function generateForParticipant(actor: AuthUser, workshopId: string, participantId: string) {
  if (actor.role === "PARTICIPANT" && actor.id !== participantId) {
    throw new ApiError(403, "FORBIDDEN", "You can only request your own certificate");
  }
  if (actor.role !== "PARTICIPANT") {
    await assertCanManageWorkshop(actor, workshopId);
  }

  const existing = await prisma.certificate.findUnique({
    where: { userId_workshopId: { userId: participantId, workshopId } },
  });
  if (existing && existing.status === "ISSUED") return existing;

  const workshop = await prisma.workshop.findUnique({ where: { id: workshopId } });
  if (!workshop) throw new ApiError(404, "NOT_FOUND", "Workshop not found");
  if (workshop.status !== "COMPLETED" && workshop.status !== "PUBLISHED") {
    throw new ApiError(409, "WORKSHOP_NOT_READY", "Certificates are available after the workshop is running or completed");
  }

  const registration = await prisma.registration.findUnique({
    where: { workshopId_userId: { workshopId, userId: participantId } },
  });
  if (!registration || registration.status !== "CONFIRMED") {
    throw new ApiError(403, "NOT_REGISTERED", "Participant is not confirmed for this workshop");
  }

  const eligibility = await evaluateCertificateEligibility(workshopId, registration.id);
  if (!eligibility.eligible) {
    throw new ApiError(
      403,
      "NOT_ELIGIBLE",
      `Participant is not eligible: ${eligibility.reasons.join(" ")}`,
    );
  }

  const participant = await prisma.user.findUnique({ where: { id: participantId } });
  if (!participant) throw new ApiError(404, "NOT_FOUND", "Participant not found");

  const certificateCode = randomToken(8);
  const issuedAt = new Date();
  const pdfPath = await writeCertificatePdf({
    certificateCode,
    participantName: `${participant.firstName} ${participant.lastName}`,
    workshopTitle: workshop.title,
    attendancePercentage: eligibility.attendancePercentage,
    issuedAt,
  });

  const certificate = await prisma.certificate.create({
    data: {
      certificateCode,
      userId: participantId,
      workshopId,
      attendancePercentage: eligibility.attendancePercentage,
      pdfPath,
      issuedAt,
      verification: { create: {} },
    },
  });
  await recordAudit(actor.id, "GENERATE_CERTIFICATE", "Certificate", certificate.id, {
    percentage: eligibility.attendancePercentage,
  });
  await emitWorkshopDomainEvent({
    type: "CERTIFICATE_ISSUED",
    userId: participantId,
    workshopTitle: workshop.title,
    certificateCode,
  });
  return certificate;
}

export async function listMine(userId: string) {
  return prisma.certificate.findMany({
    where: { userId },
    include: { workshop: { select: { id: true, title: true } } },
    orderBy: { issuedAt: "desc" },
  });
}

export async function listForWorkshop(workshopId: string) {
  return prisma.certificate.findMany({
    where: { workshopId },
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
  });
}

export async function verify(certificateCode: string) {
  const certificate = await prisma.certificate.findUnique({
    where: { certificateCode },
    include: {
      user: { select: { firstName: true, lastName: true } },
      workshop: {
        select: {
          title: true,
          organizer: { select: { firstName: true, lastName: true, organization: { select: { name: true } } } },
          department: { select: { organization: { select: { name: true } } } },
        },
      },
      verification: true,
    },
  });
  if (!certificate || certificate.status !== "ISSUED") {
    throw new ApiError(404, "NOT_FOUND", "Certificate not found");
  }
  await prisma.certificateVerification.update({
    where: { certificateId: certificate.id },
    data: {
      verificationCount: { increment: 1 },
      lastVerifiedAt: new Date(),
    },
  });
  return {
    valid: true,
    certificateCode: certificate.certificateCode,
    participantName: `${certificate.user.firstName} ${certificate.user.lastName}`,
    workshopTitle: certificate.workshop.title,
    organizerName: `${certificate.workshop.organizer.firstName} ${certificate.workshop.organizer.lastName}`,
    organizationName:
      certificate.workshop.department?.organization.name ??
      certificate.workshop.organizer.organization?.name ??
      null,
    attendancePercentage: certificate.attendancePercentage,
    issuedAt: certificate.issuedAt,
    pdfPath: certificate.pdfPath,
  };
}
