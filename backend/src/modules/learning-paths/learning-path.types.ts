export type LearningPathInput = {
  title: string;
  description: string;
  domain?: "ENGINEERING" | "ARTS_SCIENCE" | "TAMIL_LANGUAGE" | "OTHER";
  workshopIds: string[];
};
