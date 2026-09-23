export type SkillPassport = {
  skills: { level: string; verified: boolean; skill: { name: string } }[];
  certificates: { certificateCode: string; workshop: { title: string; skills: { skill: { name: string } }[] } }[];
};
