import { api, unwrap } from "./api";
import type { Assessment } from "../types/assessment";

export async function listAssessments(workshopId: string) {
  return unwrap<Assessment[]>(await api.get("/assessments", { params: { workshopId } }));
}
export async function submitAssessment(id: string, answers: number[]) {
  return unwrap<{ score: number; maxScore: number }>(await api.post(`/assessments/${id}/submissions`, { answers }));
}
export async function createAssessment(body: Record<string, unknown>) {
  return unwrap<Assessment>(await api.post("/assessments", body));
}
