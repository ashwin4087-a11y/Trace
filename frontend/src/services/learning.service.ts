import { api, unwrap } from "./api";
import type { LearningMaterial } from "../types/learning";

export async function listMaterials(workshopId: string) {
  return unwrap<LearningMaterial[]>(await api.get("/learning", { params: { workshopId } }));
}
export async function addMaterial(body: { workshopId: string; title: string; type: string; url: string }) {
  return unwrap<LearningMaterial>(await api.post("/learning", body));
}
