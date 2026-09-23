import { z } from "zod";
import { passwordSchema } from "../../shared/validators/common";

const organizationFields = {
  organizationId: z.string().uuid(),
  departmentId: z.string().uuid(),
};

export const listSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(120).optional(),
    status: z.enum(["ACTIVE", "SUSPENDED", "DEACTIVATED"]).optional(),
    organizationId: z.string().uuid().optional(),
    departmentId: z.string().uuid().optional(),
  }),
});

export const idSchema = z.object({ params: z.object({ id: z.string().uuid() }) });

export const createSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email: z.string().email(),
    password: passwordSchema,
    name: z.string().trim().min(1).max(160).nullable().optional(),
    phone: z.string().trim().min(7).max(30).nullable().optional(),
    designation: z.string().trim().min(1).max(120),
    ...organizationFields,
  }),
});

export const updateSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    firstName: z.string().trim().min(1).max(80).optional(),
    lastName: z.string().trim().min(1).max(80).optional(),
    name: z.string().trim().min(1).max(160).nullable().optional(),
    phone: z.string().trim().min(7).max(30).nullable().optional(),
    designation: z.string().trim().min(1).max(120).optional(),
    ...organizationFields,
  }),
});

export const statusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ status: z.enum(["ACTIVE", "SUSPENDED", "DEACTIVATED"]) }),
});
