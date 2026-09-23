export type ProfileSignals = {
  domain?: string | null;
  departmentName?: string | null;
  year?: string | null;
  skills: string[];
  interests: string[];
  language: string
};

export type WorkshopSignals = {
  id: string;
  domain: string;
  departmentName?: string | null;
  level: string;
  language: string;
  skills: string[];
  category: string;
  title: string;
};

export function scoreWorkshop(
  profile: ProfileSignals,
  workshop: WorkshopSignals,
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const skills = new Set(profile.skills.map((item) => item.toLowerCase()));
  const interests = new Set(profile.interests.map((item) => item.toLowerCase()));

  if (profile.domain && profile.domain === workshop.domain) {
    score += 40;
    reasons.push("Academic domain matches");
  }
  if (
    profile.departmentName &&
    workshop.departmentName &&
    profile.departmentName.toLowerCase() === workshop.departmentName.toLowerCase()
  ) {
    score += 15;
    reasons.push("Department matches");
  }
  if (profile.language === workshop.language || profile.language === "EN_TA" || workshop.language === "EN_TA") {
    score += 15;
    reasons.push("Language preference matches");
  }

  const skillHits = workshop.skills.filter((skill) => skills.has(skill.toLowerCase()));
  if (skillHits.length > 0) {
    score += Math.min(20, skillHits.length * 10);
    reasons.push(`Skills: ${skillHits.join(", ")}`);
  }

  const interestHits = [workshop.category, workshop.title, ...workshop.skills].filter((value) =>
    interests.has(value.toLowerCase()),
  );
  if (interestHits.length > 0) {
    score += 10;
    reasons.push("Interest overlap");
  }

  if ((profile.year === "FIRST" || profile.year === "SECOND") && workshop.level === "BEGINNER") {
    score += 5;
    reasons.push("Level fits early year of study");
  }

  return { score, reasons };
}
