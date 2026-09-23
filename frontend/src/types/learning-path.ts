export type LearningPath = {
  id: string;
  title: string;
  description: string;
  domain?: string | null;
  steps?: { position: number; workshop: { id: string; title: string } }[];
};
