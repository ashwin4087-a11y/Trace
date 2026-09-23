import type { AuthUser } from "../../shared/types/http";
import type { AcademicDomain, PreferredLanguage, Prisma, WorkshopStatus } from "@prisma/client";
import { prisma } from "../../config/database";
import { normalizeMeetingUrl } from "../../integrations/meetings/meeting.provider";
import { ApiError } from "../../shared/errors/api-error";
import { recordAudit } from "../audit/audit.service";
import { enqueueWorkshopPublished } from "../../jobs/notification.job";

const workshopInclude = {
  skills: { include: { skill: true } },
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

export async function assertCanManageWorkshop(user: AuthUser, workshopId: string) {
  const workshop = await prisma.workshop.findUnique({ where: { id: workshopId } });
  if (!workshop) throw new ApiError(404, "NOT_FOUND", "Workshop not found");
  const roles = user.roles.length ? user.roles : [user.role];
  if (roles.includes("ADMIN")) return workshop;
  if (roles.includes("ORGANIZER") && workshop.organizerId === user.id) return workshop;
  throw new ApiError(403, "FORBIDDEN", "You can only manage your own workshops");
}

export async function listWorkshops(user: AuthUser | undefined, query: {
  page: number;
  pageSize: number;
  search?: string;
  domain?: string;
  language?: string;
  status?: WorkshopStatus;
  mine?: boolean;
}) {
  const where: Prisma.WorkshopWhereInput = {};
  const roles = user?.roles.length ? user.roles : user ? [user.role] : [];
  if (!user || roles.includes("PARTICIPANT")) {
    where.status = "PUBLISHED";
  } else if (roles.includes("ORGANIZER") && !roles.includes("ADMIN")) {
    where.organizerId = user.id;
    if (query.status) where.status = query.status;
  } else if (query.status) {
    where.status = query.status;
  }
  if (query.mine && user && roles.includes("ORGANIZER")) where.organizerId = user.id;
  if (query.domain) where.domain = query.domain as AcademicDomain;
  if (query.language) where.language = query.language as PreferredLanguage;
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { category: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }
  const [items, total] = await Promise.all([
    prisma.workshop.findMany({
      where,
      include: workshopInclude,
      orderBy: { startDate: "asc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.workshop.count({ where }),
  ]);
  return { items, total };
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
  const roles = user?.roles.length ? user.roles : user ? [user.role] : [];
  const canSeeDraft =
    user && (roles.includes("ADMIN") || (roles.includes("ORGANIZER") && workshop.organizerId === user.id));
  if (workshop.status !== "PUBLISHED" && !canSeeDraft) {
    throw new ApiError(404, "NOT_FOUND", "Workshop not found");
  }
  return workshop;
}

type WorkshopWrite = {
  title: string;
  description: string;
  category: string;
  domain: "ENGINEERING" | "ARTS_SCIENCE" | "TAMIL_LANGUAGE" | "OTHER";
  departmentId?: string | null;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  skills?: string[];
  trainerName: string;
  startDate: string;
  endDate: string;
  durationHours: number;
  mode: "ONLINE" | "OFFLINE" | "HYBRID";
  capacity: number;
  waitlistEnabled?: boolean;
  registrationDeadline: string;
  language: "EN" | "TA" | "EN_TA";
  meetingUrl?: string | null;
  venue?: string | null;
  priceCents?: number;
  currency?: string;
};

function meetingFields(url?: string | null) {
  try {
    return normalizeMeetingUrl(url);
  } catch (error) {
    throw new ApiError(400, "INVALID_MEETING_URL", error instanceof Error ? error.message : "Invalid meeting URL");
  }
}

export async function createWorkshop(user: AuthUser, input: WorkshopWrite) {
  const meeting = meetingFields(input.meetingUrl);
  const skillLinks = await connectSkills(input.skills ?? []);
  const workshop = await prisma.workshop.create({
    data: {
      organizerId: user.id,
      title: input.title,
      description: input.description,
      category: input.category,
      domain: input.domain,
      departmentId: input.departmentId ?? undefined,
      level: input.level,
      trainerName: input.trainerName,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      durationHours: input.durationHours,
      mode: input.mode,
      capacity: input.capacity,
      waitlistEnabled: input.waitlistEnabled ?? true,
      registrationDeadline: new Date(input.registrationDeadline),
      language: input.language,
      meetingUrl: meeting.url,
      meetingProvider: meeting.provider,
      venue: input.venue,
      priceCents: input.priceCents ?? 0,
      currency: input.currency ?? "INR",
      status: "DRAFT",
      skills: { create: skillLinks },
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
    await prisma.workshopSkill.deleteMany({ where: { workshopId: id } });
    await prisma.workshopSkill.createMany({
      data: skillLinks.map((item) => ({ workshopId: id, skillId: item.skillId })),
    });
  }
  return prisma.workshop.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      category: input.category,
      domain: input.domain,
      departmentId: input.departmentId ?? undefined,
      level: input.level,
      trainerName: input.trainerName,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      durationHours: input.durationHours,
      mode: input.mode,
      capacity: input.capacity,
      waitlistEnabled: input.waitlistEnabled,
      registrationDeadline: input.registrationDeadline ? new Date(input.registrationDeadline) : undefined,
      language: input.language,
      meetingUrl: meeting?.url,
      meetingProvider: meeting?.provider,
      venue: input.venue,
      priceCents: input.priceCents,
      currency: input.currency,
    },
    include: workshopInclude,
  });
}

export async function changeStatus(user: AuthUser, id: string, status: WorkshopStatus) {
  const workshop = await assertCanManageWorkshop(user, id);
  const updated = await prisma.workshop.update({ where: { id }, data: { status }, include: workshopInclude });
  if (status === "PUBLISHED" && workshop.status !== "PUBLISHED") {
    await recordAudit(user.id, "PUBLISH_WORKSHOP", "Workshop", id);
    await prisma.community.upsert({
      where: { workshopId: id },
      update: {},
      create: { workshopId: id, name: `${updated.title} community`, description: "Workshop discussion space" },
    });
    await enqueueWorkshopPublished(id);
  }
  return updated;
}
