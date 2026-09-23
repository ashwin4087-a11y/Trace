import type { Prisma, WorkshopStatus } from "@prisma/client";
import type { z } from "zod";
import type { listWorkshopSchema } from "./workshop.validation";
import type { AuthUser } from "../../shared/types/http";

export type ListWorkshopQuery = z.infer<typeof listWorkshopSchema>["query"];

export function buildDiscoveryQuery(user: AuthUser | undefined, query: ListWorkshopQuery & { mine?: boolean }) {
  const where: Prisma.WorkshopWhereInput = {};

  // Visibility Rules
  if (!user || user.role === "PARTICIPANT") {
    // Normal participants can discover published, registration open/closed, and ongoing workshops.
    // They cannot discover drafts, cancelled, or archived workshops.
    where.status = { in: ["PUBLISHED", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "ONGOING", "COMPLETED"] };
    if (query.status) {
      if (["PUBLISHED", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "ONGOING", "COMPLETED"].includes(query.status)) {
        where.status = query.status as WorkshopStatus;
      }
    }
  } else if (user.role === "ORGANIZER") {
    if (!query.mine) {
      // If organizer is just browsing the public catalog, act like a participant
      where.status = { in: ["PUBLISHED", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "ONGOING", "COMPLETED"] };
      if (query.status) {
        if (["PUBLISHED", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "ONGOING", "COMPLETED"].includes(query.status)) {
          where.status = query.status as WorkshopStatus;
        }
      }
    } else {
      // If organizer is looking at their own workshops
      where.organizerId = user.id;
      if (query.status) where.status = query.status as WorkshopStatus;
    }
  } else {
    // Admin or other roles
    if (query.status) where.status = query.status as WorkshopStatus;
  }

  if (query.mine && user?.role === "ORGANIZER") {
    where.organizerId = user.id;
  }

  // Exact match filters
  if (query.domain) where.domain = query.domain as any;
  if (query.departmentId) where.departmentId = query.departmentId;
  if (query.category) where.category = query.category;
  if (query.language) where.language = query.language as any;
  if (query.mode) where.mode = query.mode as any;
  if (query.level) where.level = query.level as any;
  if (query.certificateEnabled !== undefined) {
    where.certificateEnabled = query.certificateEnabled === "true" || query.certificateEnabled === true;
  }

  // Price filters
  if (query.price === "free") where.priceCents = 0;
  if (query.price === "paid") where.priceCents = { gt: 0 };

  // Date filters
  if (query.date === "upcoming") {
    where.startDate = { gte: new Date() };
  } else if (query.date) {
    // Basic date parsing logic if needed in the future
  }

  // Skills filter (comma separated)
  if (query.skills) {
    const skillsList = query.skills.split(",").map((s: string) => s.trim()).filter(Boolean);
    if (skillsList.length > 0) {
      where.AND = skillsList.map((skillName) => ({
        workshopSkills: {
          some: { skill: { name: skillName } },
        },
      }));
    }
  }

  // Search filter
  if (query.search) {
    const searchTerms = query.search.trim();
    where.OR = [
      { title: { contains: searchTerms, mode: "insensitive" } },
      { description: { contains: searchTerms, mode: "insensitive" } },
      { shortDescription: { contains: searchTerms, mode: "insensitive" } },
      { trainerName: { contains: searchTerms, mode: "insensitive" } },
      { category: { contains: searchTerms, mode: "insensitive" } },
      { workshopSkills: { some: { skill: { name: { contains: searchTerms, mode: "insensitive" } } } } },
    ];
  }

  // Sorting
  const orderBy: Prisma.WorkshopOrderByWithRelationInput[] = [];
  switch (query.sort) {
    case "newest":
      orderBy.push({ createdAt: "desc" });
      break;
    case "upcoming":
      orderBy.push({ startDate: "asc" });
      break;
    case "date":
      orderBy.push({ startDate: "asc" });
      break;
    case "price-low-to-high":
      orderBy.push({ priceCents: "asc" });
      break;
    case "price-high-to-low":
      orderBy.push({ priceCents: "desc" });
      break;
    default:
      if (!user || user.role === "PARTICIPANT") {
        orderBy.push({ startDate: "asc" });
      } else {
        orderBy.push({ createdAt: "desc" });
      }
      break;
  }

  return { where, orderBy };
}
