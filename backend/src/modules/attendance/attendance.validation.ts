import { z } from "zod";

export const markSchema = z.object({
  body: z.object({
    sessionId: z.string().uuid(),
    registrationId: z.string().uuid(),
    status: z.enum(["PRESENT", "ABSENT", "EXCUSED"]),
    note: z.string().optional(),
  }),
});

export const bulkMarkSchema = z.object({
  body: z.object({
    registrationIds: z.array(z.string().uuid()).min(1),
    status: z.enum(["PRESENT", "ABSENT"]),
  }),
});

export const correctSchema = z.object({
  body: z.object({
    status: z.enum(["PRESENT", "ABSENT", "EXCUSED"]),
    reason: z.string().min(1, "Reason is required"),
  }),
});

export const qrSchema = z.object({
  body: z.object({
    token: z.string().min(20),
  }),
});
