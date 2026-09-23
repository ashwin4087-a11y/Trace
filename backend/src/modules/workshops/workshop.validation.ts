import { z } from "zod";

const body = z.object({
  title: z.string().trim().min(3),
  description: z.string().trim().min(10),
  category: z.string().trim().min(2),
  domain: z.enum(["ENGINEERING", "ARTS_SCIENCE", "TAMIL_LANGUAGE", "OTHER"]),
  departmentId: z.string().uuid().nullable().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  skills: z.array(z.string()).optional(),
  trainerName: z.string().trim().min(2),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  durationHours: z.number().positive(),
  mode: z.enum(["ONLINE", "OFFLINE", "HYBRID"]),
  capacity: z.number().int().positive(),
  waitlistEnabled: z.boolean().optional(),
  registrationDeadline: z.string().datetime(),
  language: z.enum(["EN", "TA", "EN_TA"]),
  meetingUrl: z.string().url().nullable().optional(),
  venue: z.string().nullable().optional(),
  priceCents: z.number().int().min(0).optional(),
  currency: z.string().length(3).optional(),
});

export const createWorkshopSchema = z.object({ body });
export const updateWorkshopSchema = z.object({ body: body.partial() });
export const listWorkshopSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    domain: z.string().optional(),
    language: z.string().optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED", "ARCHIVED"]).optional(),
  }),
});
