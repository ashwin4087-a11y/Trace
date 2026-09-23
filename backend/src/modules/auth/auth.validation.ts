import { z } from "zod";
import { passwordSchema } from "../../shared/validators/common";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: passwordSchema,
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    preferredLanguage: z.enum(["EN", "TA", "EN_TA"]).default("EN"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const tokenSchema = z.object({
  body: z.object({
    token: z.string().min(20),
  }),
});

export const forgotSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetSchema = z.object({
  body: z.object({
    token: z.string().min(20),
    password: passwordSchema,
  }),
});
