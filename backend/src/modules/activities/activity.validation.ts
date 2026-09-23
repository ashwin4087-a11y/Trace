import { z } from "zod";

export const createActivitySchema = z.object({
  body: z.object({
    workshopId: z.string().uuid("Invalid workshop ID"),
    sessionId: z.string().uuid("Invalid session ID").optional().nullable(),
    title: z.string().min(2, "Title must be at least 2 characters").max(150, "Title is too long"),
    description: z.string().min(2, "Description is required"),
    instructions: z.string().optional().nullable(),
    type: z.enum(["ASSIGNMENT", "PRACTICAL_TASK", "PROJECT", "SURVEY", "EXERCISE", "RESOURCE_BASED"]),
    isRequired: z.boolean().default(true),
    dueAt: z.string().datetime({ offset: true }).optional().nullable(),
    maxScore: z.number().int().min(1).optional().nullable(),
    submissionType: z.enum(["TEXT", "FILE", "URL", "TEXT_AND_FILE", "TEXT_AND_URL", "NONE"]),
    resourceUrl: z.string().url("Invalid resource URL").optional().nullable(),
  }),
});

export const updateActivitySchema = z.object({
  body: z.object({
    sessionId: z.string().uuid().optional().nullable(),
    title: z.string().min(2).max(150).optional(),
    description: z.string().min(2).optional(),
    instructions: z.string().optional().nullable(),
    type: z.enum(["ASSIGNMENT", "PRACTICAL_TASK", "PROJECT", "SURVEY", "EXERCISE", "RESOURCE_BASED"]).optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"]).optional(),
    isRequired: z.boolean().optional(),
    dueAt: z.string().datetime({ offset: true }).optional().nullable(),
    maxScore: z.number().int().min(1).optional().nullable(),
    submissionType: z.enum(["TEXT", "FILE", "URL", "TEXT_AND_FILE", "TEXT_AND_URL", "NONE"]).optional(),
    resourceUrl: z.string().url().optional().nullable(),
  }),
});

export const reorderActivitiesSchema = z.object({
  body: z.object({
    activities: z.array(
      z.object({
        id: z.string().uuid(),
        sortOrder: z.number().int(),
      }),
    ),
  }),
});

export const submitActivitySchema = z.object({
  body: z.object({
    textContent: z.string().optional(),
    submissionUrl: z.string().url("Invalid submission URL").optional().or(z.literal("")),
  }).refine((data) => {
    // If submission requires fields, they'll be validated at the controller level based on submissionType
    return true;
  }),
});

export const reviewSubmissionSchema = z.object({
  body: z.object({
    status: z.enum(["UNDER_REVIEW", "COMPLETED", "RETURNED", "LATE"]),
    score: z.number().int().min(0).optional().nullable(),
    feedback: z.string().optional().nullable(),
  }),
});
