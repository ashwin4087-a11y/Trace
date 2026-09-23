import { z } from "zod";

export const markSchema = z.object({
  body: z.object({
    sessionId: z.string().uuid(),
    userId: z.string().uuid(),
    status: z.enum(["PRESENT", "ABSENT", "EXCUSED"]),
    note: z.string().optional(),
  }),
});

export const correctSchema = z.object({
  body: z.object({
    status: z.enum(["PRESENT", "ABSENT", "EXCUSED"]),
    note: z.string().optional(),
  }),
});

export const qrSchema = z.object({
  body: z.object({
    token: z.string().min(20),
  }),
});
