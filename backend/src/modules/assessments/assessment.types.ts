import { z } from "zod";

export type AssessmentQuestionInput = {
  prompt: string;
  type: "MCQ_SINGLE";
  options: string[];
  correctIndex: number;
  points?: number;
  explanation?: string;
};

export type CreateAssessmentInput = {
  workshopId: string;
  sessionId?: string;
  title: string;
  description?: string;
  instructions?: string;
  type?: "QUIZ" | "MCQ" | "OBJECTIVE";
  durationMinutes?: number;
  passScore?: number;
  maxAttempts?: number;
  isRequired?: boolean;
  dueAt?: string;
  questions?: AssessmentQuestionInput[];
};

export type UpdateAssessmentInput = Partial<Omit<CreateAssessmentInput, "workshopId" | "questions">>;

export type SubmitAttemptInput = {
  answers: Array<{
    questionId: string;
    selectedOptionIndex: number;
  }>;
};
