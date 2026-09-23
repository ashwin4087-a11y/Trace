import { z } from "zod";

const allStatuses = [
  "DRAFT",
  "PUBLISHED",
  "REGISTRATION_OPEN",
  "REGISTRATION_CLOSED",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
  "ARCHIVED",
] as const;

const draftBodyBase = z.object({
  title: z.string().trim().min(3),
  slug: z.string().trim().min(1).optional(),
  description: z.string().trim().min(10).optional().nullable(),
  shortDescription: z.string().trim().nullable().optional(),
  bannerImage: z.string().url().nullable().optional(),
  category: z.string().trim().min(2).optional().nullable(),
  domain: z.enum(["ENGINEERING", "ARTS_SCIENCE", "TAMIL_LANGUAGE", "OTHER"]).optional().nullable(),
  departmentId: z.string().uuid().nullable().optional(),
  organizationId: z.string().uuid().nullable().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional().nullable(),
  skills: z.array(z.string()).optional(),
  trainerName: z.string().trim().min(2).optional().nullable(),
  trainerProfile: z.string().trim().nullable().optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  durationHours: z.number().positive().optional().nullable(),
  mode: z.enum(["ONLINE", "OFFLINE", "HYBRID"]).optional().nullable(),
  location: z.string().trim().nullable().optional(),
  capacity: z.number().int().positive("Capacity must be a positive integer").optional().nullable(),
  waitlistEnabled: z.boolean().optional(),
  registrationDeadline: z.string().datetime().optional().nullable(),
  language: z.enum(["EN", "TA", "EN_TA"]).optional().nullable(),
  meetingUrl: z.string().url().nullable().optional(),
  venue: z.string().nullable().optional(),
  price: z.number().min(0, "Price cannot be negative").optional().nullable(),
  priceCents: z.number().int().min(0, "Price cannot be negative").optional().nullable(),
  currency: z.string().length(3).optional().nullable(),
  certificateEnabled: z.boolean().optional(),
});

const withRefinements = (schema: typeof draftBodyBase | z.ZodTypeAny) => schema.refine(
  (data: any) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate).getTime() < new Date(data.endDate).getTime();
    }
    return true;
  },
  { message: "Start date must be before end date", path: ["endDate"] },
).refine(
  (data: any) => {
    if (data.registrationDeadline && data.startDate) {
      return new Date(data.registrationDeadline).getTime() <= new Date(data.startDate).getTime();
    }
    return true;
  },
  { message: "Registration deadline cannot be after start date", path: ["registrationDeadline"] },
);

export const createWorkshopSchema = z.object({ body: withRefinements(draftBodyBase) });
export const updateWorkshopSchema = z.object({ body: withRefinements(draftBodyBase.partial()) });

// Validation for publishing a workshop
export const publishValidationSchema = z.object({
  title: z.string().trim().min(3, "Title is required"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  domain: z.enum(["ENGINEERING", "ARTS_SCIENCE", "TAMIL_LANGUAGE", "OTHER"], { required_error: "Domain is required" }),
  category: z.string().trim().min(2, "Category is required"),
  trainerName: z.string().trim().min(2, "Trainer name is required"),
  language: z.enum(["EN", "TA", "EN_TA"], { required_error: "Language is required" }),
  mode: z.enum(["ONLINE", "OFFLINE", "HYBRID"], { required_error: "Delivery mode is required" }),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  registrationDeadline: z.date({ required_error: "Registration deadline is required" }),
  capacity: z.number().int().positive("Capacity must be a positive integer"),
  priceCents: z.number().int().min(0, "Price cannot be negative").optional(),
  meetingUrl: z.string().url("Valid meeting URL is required for online mode").nullable().optional(),
}).refine(
  (data) => {
    if (data.mode === "ONLINE" && !data.meetingUrl) return false;
    return true;
  },
  { message: "Meeting URL is required for online workshops", path: ["meetingUrl"] }
).refine(
  (data) => data.startDate.getTime() < data.endDate.getTime(),
  { message: "Start date must be before end date", path: ["endDate"] }
).refine(
  (data) => data.registrationDeadline.getTime() <= data.startDate.getTime(),
  { message: "Registration deadline cannot be after start date", path: ["registrationDeadline"] }
);

export const listWorkshopSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    domain: z.string().optional(),
    departmentId: z.string().optional(),
    category: z.string().optional(),
    language: z.string().optional(),
    mode: z.string().optional(),
    level: z.string().optional(),
    price: z.string().optional(),
    certificateEnabled: z.enum(["true", "false", ""]).optional().transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
    skills: z.string().optional(), // Can be comma-separated
    date: z.string().optional(), // 'upcoming' or specific date range indicator
    sort: z.enum(["newest", "upcoming", "date", "price-low-to-high", "price-high-to-low"]).optional().default("upcoming"),
    status: z.enum(allStatuses).optional(),
  }),
});
