import { z } from "zod";
import { passwordSchema } from "../../shared/validators/common";

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    role: z.enum(["ADMIN", "ORGANIZER", "PARTICIPANT"]).optional(),
    status: z.enum(["PENDING_VERIFICATION", "ACTIVE", "SUSPENDED", "DEACTIVATED"]).optional(),
    organizationId: z.string().uuid().optional(),
    departmentId: z.string().uuid().optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(1).max(80).optional(),
    lastName: z.string().trim().min(1).max(80).optional(),
    name: z.string().trim().min(1).max(160).nullable().optional(),
    phone: z.string().trim().min(7).max(30).nullable().optional(),
    organizationId: z.string().uuid().nullable().optional(),
    departmentId: z.string().uuid().nullable().optional(),
    preferredLanguage: z.enum(["EN", "TA", "EN_TA"]).optional(),
  }),
});

export const roleSchema = z.object({
  body: z.object({
    role: z.enum(["ADMIN", "ORGANIZER", "PARTICIPANT"]),
  }),
});

export const statusSchema = z.object({
  body: z.object({
    status: z.enum(["PENDING_VERIFICATION", "ACTIVE", "SUSPENDED", "DEACTIVATED"]),
  }),
});

export const createOrganizerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: passwordSchema,
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    organizationId: z.string().uuid().optional(),
    departmentId: z.string().uuid().optional(),
  }),
});
