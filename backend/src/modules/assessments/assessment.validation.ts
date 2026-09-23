import { z } from "zod";

const BaseAssessmentQuestionSchema = z.object({
  prompt: z.string().min(2, "Question prompt is required"),
  type: z.enum(["MCQ_SINGLE"]).default("MCQ_SINGLE"),
  options: z.array(z.string().min(1, "Option cannot be empty")).min(2, "At least 2 options are required"),
  correctIndex: z.number().int().min(0),
  points: z.number().int().positive().default(1),
  explanation: z.string().optional(),
});

const AssessmentQuestionSchema = BaseAssessmentQuestionSchema.refine(data => data.correctIndex < data.options.length, {
  message: "correctIndex must be within the bounds of the options array",
  path: ["correctIndex"],
});

export const CreateAssessmentSchema = z.object({
  body: z.object({
    workshopId: z.string().uuid(),
    sessionId: z.string().uuid().optional(),
    title: z.string().min(2, "Title is required"),
    description: z.string().optional(),
    instructions: z.string().optional(),
    type: z.enum(["QUIZ", "MCQ", "OBJECTIVE"]).default("QUIZ"),
    durationMinutes: z.number().int().positive().optional(),
    passScore: z.number().int().min(0).max(100).default(50),
    maxAttempts: z.number().int().min(1).default(1),
    isRequired: z.boolean().default(true),
    dueAt: z.string().datetime().optional(),
    questions: z.array(AssessmentQuestionSchema).optional(),
  }),
});

export const UpdateAssessmentSchema = z.object({
  body: z.object({
    sessionId: z.string().uuid().optional().nullable(),
    title: z.string().min(2).optional(),
    description: z.string().optional().nullable(),
    instructions: z.string().optional().nullable(),
    type: z.enum(["QUIZ", "MCQ", "OBJECTIVE"]).optional(),
    durationMinutes: z.number().int().positive().optional().nullable(),
    passScore: z.number().int().min(0).max(100).optional(),
    maxAttempts: z.number().int().min(1).optional(),
    isRequired: z.boolean().optional(),
    dueAt: z.string().datetime().optional().nullable(),
  }),
});

export const CreateQuestionSchema = z.object({
  body: AssessmentQuestionSchema,
});

export const UpdateQuestionSchema = z.object({
  body: BaseAssessmentQuestionSchema.partial(),
});

export const SubmitAttemptSchema = z.object({
  body: z.object({
    answers: z.array(z.object({
      questionId: z.string().uuid(),
      selectedOptionIndex: z.number().int().min(0),
    })),
  }),
});
