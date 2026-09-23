export type AssessmentQuestionInput = {
  prompt: string;
  type: "MCQ" | "SHORT_ANSWER";
  options?: string[];
  correctIndex?: number;
  points?: number;
};
