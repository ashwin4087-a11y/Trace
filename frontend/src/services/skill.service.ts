import { api, unwrap } from "./api";
import type { SkillPassport } from "../types/skill";

export async function passport() {
  return unwrap<SkillPassport>(await api.get("/skills/me"));
}
export async function addSkill(name: string, level: string) {
  return unwrap<unknown>(await api.post("/skills/me", { name, level }));
}
