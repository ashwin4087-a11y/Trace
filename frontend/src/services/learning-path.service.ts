import { api, unwrap } from "./api";
import type { LearningPath } from "../types/learning-path";

export async function listPaths() {
  return unwrap<LearningPath[]>(await api.get("/learning-paths"));
}
export async function myPaths() {
  return unwrap<Array<LearningPath & { completedSteps: number; totalSteps: number; learningPath: LearningPath }>>(
    await api.get("/learning-paths/me"),
  );
}
export async function enroll(id: string) {
  return unwrap<unknown>(await api.post(`/learning-paths/${id}/enroll`));
}
