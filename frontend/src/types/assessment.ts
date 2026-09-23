export type Assessment = {
  id: string;
  title: string;
  description?: string | null;
  passScore: number;
  questions: { id: string; prompt: string; type: string; options?: string[] | null; points: number }[];
};
