import type { AuthUser } from "../../shared/types/http";
import type { AcademicDomain, PreferredLanguage, Prisma, WorkshopStatus } from "@prisma/client";
import { prisma } from "../../config/database";
import { normalizeMeetingUrl } from "../../integrations/meetings/meeting.provider";
import { ApiError } from "../../shared/errors/api-error";
import { canSeeMeetingLinks } from "../../shared/utils/meeting-access";
import { recordAudit } from "../audit/audit.service";
import { emitWorkshopDomainEvent } from "./workshop.events";
import { buildDiscoveryQuery, type ListWorkshopQuery } from "./workshop.query-builder";

const workshopInclude = {
  workshopSkills: { include: { skill: true } },
  department: true,
  organizer: { select: { id: true, firstName: true, lastName: true, email: true } },
  _count: { select: { registrations: true, sessions: true } },
} satisfies Prisma.WorkshopInclude;

async function connectSkills(names: string[]) {
  const unique = [...new Set(names.map((name) => name.trim()).filter(Boolean))];
  const records = [];
  for (const name of unique) {
    const skill = await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    records.push({ skillId: skill.id });
  }
  return records;
}

/** Generate a URL-friendly slug from a title, appending a suffix to resolve collisions. */
async function generateSlug(title: string, excludeId?: string): Promise<string> {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const slug = base || "workshop";
  const where: Prisma.WorkshopWhereInput = { slug };
  if (excludeId) where.id = { not: excludeId };
  const existing = await prisma.workshop.findFirst({ where: { slug }, select: { id: true } });
  if (!existing || existing.id === excludeId) return slug;
  // Find next available numeric suffix
  for (let i = 2; i < 10000; i++) {
    const candidate = `${slug}-${i}`;
    const collision = await prisma.workshop.findFirst({ where: { slug: candidate }, select: { id: true } });
    if (!collision || collision.id === excludeId) return candidate;
  }
  return `${slug}-${Date.now()}`;
}

export async function assertCanManageWorkshop(user: AuthUser, workshopId: string) {
  const workshop = await prisma.workshop.findUnique({ where: { id: workshopId } });
  if (!workshop) throw new ApiError(404, "NOT_FOUND", "Workshop not found");
  const roles = user.roles?.length ? user.roles : [user.role];
  if (roles.includes("ADMIN")) return workshop;
  if (roles.includes("ORGANIZER") && workshop.organizerId === user.id) return workshop;
  throw new ApiError(403, "FORBIDDEN", "You can only manage your own workshops");
}

export async function listWorkshops(user: AuthUser | undefined, query: ListWorkshopQuery & { mine?: boolean }) {
  const { where, orderBy } = buildDiscoveryQuery(user, query);

  const [items, total] = await Promise.all([
    prisma.workshop.findMany({
      where,
      include: workshopInclude,
      orderBy,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.workshop.count({ where }),
  ]);
  const visible = items.map((workshop) => {
    const allowed = canSeeMeetingLinks({
      role: user?.role,
      userId: user?.id,
      organizerId: workshop.organizerId,
    });
    return allowed ? workshop : { ...workshop, meetingUrl: null };
  });
  return { items: visible, total };
}

export async function getWorkshop(user: AuthUser | undefined, id: string) {
  const workshop = await prisma.workshop.findUnique({
    where: { id },
    include: {
      ...workshopInclude,
      sessions: { orderBy: { startTime: "asc" } },
      materials: true,
      announcements: { orderBy: { publishedAt: "desc" }, take: 20 },
    },
  });
  if (!workshop) throw new ApiError(404, "NOT_FOUND", "Workshop not found");
  const roles = user?.roles?.length ? user.roles : user ? [user.role] : [];
  const canSeeDraft =
    user && (roles.includes("ADMIN") || (roles.includes("ORGANIZER") && workshop.organizerId === user.id));
  if (workshop.status !== "PUBLISHED" && !canSeeDraft) {
    throw new ApiError(404, "NOT_FOUND", "Workshop not found");
  }
  const registration = user
    ? await prisma.registration.findUnique({
        where: { workshopId_userId: { workshopId: id, userId: user.id } },
        select: { status: true },
      })
    : null;
  const allowed = canSeeMeetingLinks({
    role: user?.role,
    userId: user?.id,
    organizerId: workshop.organizerId,
    registrationStatus: registration?.status,
  });
  if (allowed) return workshop;
  return {
    ...workshop,
    meetingUrl: null,
    sessions: workshop.sessions.map((session) => ({ ...session, meetingUrl: null })),
  };
}

type WorkshopWrite = {
  title: string;
  slug?: string;
  description?: string | null;
  shortDescription?: string | null;
  bannerImage?: string | null;
  category?: string | null;
  domain?: "ENGINEERING" | "ARTS_SCIENCE" | "TAMIL_LANGUAGE" | "OTHER" | null;
  departmentId?: string | null;
  organizationId?: string | null;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | null;
  skills?: string[];
  trainerName?: string | null;
  trainerProfile?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  durationHours?: number | null;
  mode?: "ONLINE" | "OFFLINE" | "HYBRID" | null;
  location?: string | null;
  capacity?: number | null;
  waitlistEnabled?: boolean;
  registrationDeadline?: string | null;
  language?: "EN" | "TA" | "EN_TA" | null;
  meetingUrl?: string | null;
  venue?: string | null;
  price?: number | null;
  priceCents?: number | null;
  currency?: string | null;
  certificateEnabled?: boolean;
};

function meetingFields(url?: string | null) {
  try {
    return normalizeMeetingUrl(url);
  } catch (error) {
    throw new ApiError(400, "INVALID_MEETING_URL", error instanceof Error ? error.message : "Invalid meeting URL");
  }
}

export async function createWorkshop(user: AuthUser, input: WorkshopWrite) {
  const meeting = input.meetingUrl ? meetingFields(input.meetingUrl) : undefined;
  const skillLinks = await connectSkills(input.skills ?? []);
  const slug = input.slug || await generateSlug(input.title);
  const workshop = await prisma.workshop.create({
    data: {
      organizerId: user.id,
      organizationId: input.organizationId ?? user.organizationId ?? undefined,
      title: input.title,
      slug,
      description: input.description,
      shortDescription: input.shortDescription,
      bannerImage: input.bannerImage,
      category: input.category,
      domain: input.domain,
      departmentId: input.departmentId ?? undefined,
      level: input.level,
      trainerName: input.trainerName,
      trainerProfile: input.trainerProfile,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      durationHours: input.durationHours,
      mode: input.mode,
      location: input.location,
      capacity: input.capacity,
      waitlistEnabled: input.waitlistEnabled ?? true,
      registrationDeadline: input.registrationDeadline ? new Date(input.registrationDeadline) : undefined,
      language: input.language,
      meetingUrl: meeting?.url,
      meetingProvider: meeting?.provider,
      venue: input.venue,
      price: input.price ?? 0,
      priceCents: input.priceCents ?? 0,
      currency: input.currency ?? "INR",
      certificateEnabled: input.certificateEnabled ?? false,
      status: "DRAFT",
      skills: input.skills ?? [],
      workshopSkills: { create: skillLinks },
    },
    include: workshopInclude,
  });
  await recordAudit(user.id, "CREATE_WORKSHOP", "Workshop", workshop.id);
  return workshop;
}

export async function updateWorkshop(user: AuthUser, id: string, input: Partial<WorkshopWrite>) {
  await assertCanManageWorkshop(user, id);
  const meeting = input.meetingUrl !== undefined ? meetingFields(input.meetingUrl) : undefined;
  if (input.skills) {
    const skillLinks = await connectSkills(input.skills);
    await prisma.$transaction([
      prisma.workshopSkill.deleteMany({ where: { workshopId: id } }),
      prisma.workshopSkill.createMany({
        data: skillLinks.map((item) => ({ workshopId: id, skillId: item.skillId })),
      }),
    ]);
  }
  const slug = input.slug || (input.title ? await generateSlug(input.title, id) : undefined);
  return prisma.workshop.update({
    where: { id },
    data: {
      title: input.title,
      slug,
      description: input.description,
      shortDescription: input.shortDescription,
      bannerImage: input.bannerImage,
      category: input.category,
      domain: input.domain,
      departmentId: input.departmentId ?? undefined,
      organizationId: input.organizationId,
      level: input.level,
      trainerName: input.trainerName,
      trainerProfile: input.trainerProfile,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      durationHours: input.durationHours,
      mode: input.mode,
      location: input.location,
      capacity: input.capacity,
      waitlistEnabled: input.waitlistEnabled,
      registrationDeadline: input.registrationDeadline ? new Date(input.registrationDeadline) : undefined,
      language: input.language,
      meetingUrl: meeting?.url,
      meetingProvider: meeting?.provider,
      venue: input.venue,
      price: input.price ?? undefined,
      priceCents: input.priceCents ?? undefined,
      currency: input.currency ?? undefined,
      certificateEnabled: input.certificateEnabled ?? undefined,
      skills: input.skills,
    },
    include: workshopInclude,
  });
}

export async function deleteWorkshop(user: AuthUser, id: string) {
  const workshop = await assertCanManageWorkshop(user, id);
  // Only DRAFT or CANCELLED workshops can be hard-deleted
  if (workshop.status !== "DRAFT" && workshop.status !== "CANCELLED") {
    throw new ApiError(
      400,
      "INVALID_STATUS",
      "Only DRAFT or CANCELLED workshops can be deleted. Use archive for other statuses.",
    );
  }
  await prisma.workshop.delete({ where: { id } });
  return { deleted: true };
}

export async function publishWorkshop(user: AuthUser, id: string) {
  const workshop = await assertCanManageWorkshop(user, id);
  if (workshop.status !== "DRAFT") {
    throw new ApiError(400, "INVALID_STATUS", "Only DRAFT workshops can be published.");
  }
  
  // Validate required fields
  const missing = [];
  if (!workshop.title) missing.push("title");
  if (!workshop.description || workshop.description.length < 10) missing.push("description");
  if (!workshop.domain) missing.push("domain");
  if (!workshop.category) missing.push("category");
  if (!workshop.trainerName) missing.push("trainerName");
  if (!workshop.language) missing.push("language");
  if (!workshop.mode) missing.push("mode");
  if (!workshop.startDate) missing.push("startDate");
  if (!workshop.endDate) missing.push("endDate");
  if (!workshop.registrationDeadline) missing.push("registrationDeadline");
  if (workshop.capacity === null || workshop.capacity <= 0) missing.push("capacity");
  if (workshop.mode === "ONLINE" && !workshop.meetingUrl) missing.push("meetingUrl");

  if (missing.length > 0) {
    throw new ApiError(400, "WORKSHOP_PUBLISH_VALIDATION_FAILED", `Missing or invalid fields: ${missing.join(", ")}`);
  }

  if (workshop.startDate!.getTime() >= workshop.endDate!.getTime()) {
    throw new ApiError(400, "WORKSHOP_PUBLISH_VALIDATION_FAILED", "Start date must be before end date.");
  }
  if (workshop.registrationDeadline!.getTime() > workshop.startDate!.getTime()) {
    throw new ApiError(400, "WORKSHOP_PUBLISH_VALIDATION_FAILED", "Registration deadline cannot be after start date.");
  }

  // Publish using transaction
  const updated = await prisma.$transaction(async (tx) => {
    const pub = await tx.workshop.update({
      where: { id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
      include: workshopInclude,
    });
    return pub;
  });

  await recordAudit(user.id, "PUBLISH_WORKSHOP", "Workshop", id);
  await emitWorkshopDomainEvent({ 
    type: "WORKSHOP_PUBLISHED", 
    workshopId: id, 
    title: updated.title,
    domain: updated.domain!,
    departmentId: updated.departmentId,
    language: updated.language!,
    skills: updated.skills,
    startDate: updated.startDate!.toISOString(),
    publishedAt: updated.publishedAt!.toISOString(),
  });

  // Trigger bulk email to all participants
  setImmediate(async () => {
    try {
      const { sendEmail } = await import("../../integrations/email/email.provider");
      const participants = await prisma.user.findMany({
        where: { role: "PARTICIPANT", status: "ACTIVE" },
        select: { email: true, firstName: true }
      });
      for (const p of participants) {
        await sendEmail({
          to: p.email,
          subject: `New Workshop Published: ${updated.title}`,
          text: `Hello ${p.firstName},\n\nA new workshop "${updated.title}" has been published. Registration is now open!\n\nBest,\nAdmin`,
          html: `<p>Hello ${p.firstName},</p><p>A new workshop <strong>${updated.title}</strong> has been published. Registration is now open!</p><p>Best,<br>Admin</p>`
        }).catch(err => console.error(`Failed to send email to ${p.email}:`, err));
      }
    } catch (err) {
      console.error("Bulk email error on publish:", err);
    }
  });
  
  return updated;
}

export async function cancelWorkshop(user: AuthUser, id: string) {
  const workshop = await assertCanManageWorkshop(user, id);
  if (!["DRAFT", "PUBLISHED", "REGISTRATION_OPEN"].includes(workshop.status)) {
    throw new ApiError(400, "INVALID_STATUS", "Cannot cancel a workshop in this status.");
  }
  
  const updated = await prisma.workshop.update({
    where: { id },
    data: { status: "CANCELLED", cancelledAt: new Date() },
    include: workshopInclude,
  });
  return updated;
}

export async function changeStatus(user: AuthUser, id: string, status: WorkshopStatus) {
  const workshop = await assertCanManageWorkshop(user, id);
  const data: Prisma.WorkshopUpdateInput = { status };
  const updated = await prisma.workshop.update({ where: { id }, data, include: workshopInclude });
  return updated;
}
