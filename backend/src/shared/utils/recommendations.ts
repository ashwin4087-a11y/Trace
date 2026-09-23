export type ProfileSignals = {
  domain?: string | null;
  departmentName?: string | null;
  year?: string | number | null;
  skills: string[];
  interests: string[];
  language: string
};

export type WorkshopSignals = {
  id: string;
  domain?: string | null;
  departmentName?: string | null;
  level?: string | null;
  language?: string | null;
  skills: string[];
  category?: string | null;
  title: string;
  registrationCount?: number;
};

export type RecommendationBreakdown = {
  interestMatch: number;
  departmentMatch: number;
  secondaryRelevance: number;
  engagement: number;
};

export const RECOMMENDATION_WEIGHTS = {
  interestMatch: 50,
  departmentMatch: 30,
  secondaryRelevance: 10,
  engagement: 10,
} as const;

export function calculateEngagementScore(registrationCount: number, weight = RECOMMENDATION_WEIGHTS.engagement) {
  return Math.min(weight, Math.round(Math.log1p(Math.max(0, registrationCount)) * (weight / 4)));
}

function normalize(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function matchesInterest(interest: string, value: string | null | undefined) {
  const normalizedInterest = normalize(interest);
  const normalizedValue = normalize(value);
  return Boolean(normalizedInterest && normalizedValue && (
    normalizedInterest === normalizedValue ||
    normalizedInterest.includes(normalizedValue) ||
    normalizedValue.includes(normalizedInterest)
  ));
}

export function scoreWorkshop(
  profile: ProfileSignals,
  workshop: WorkshopSignals,
): { score: number; reasons: string[]; breakdown: RecommendationBreakdown } {
  const reasons: string[] = [];
  const interests = profile.interests.filter(Boolean);
  const primaryInterestMatch = interests.some((interest) =>
    matchesInterest(interest, workshop.domain) || matchesInterest(interest, workshop.category),
  );
  const secondaryHits = interests.filter((interest) =>
    [workshop.title, ...workshop.skills].some((value) => matchesInterest(interest, value)),
  );

  const breakdown: RecommendationBreakdown = {
    interestMatch: primaryInterestMatch ? RECOMMENDATION_WEIGHTS.interestMatch : 0,
    departmentMatch: 0,
    secondaryRelevance: Math.min(RECOMMENDATION_WEIGHTS.secondaryRelevance, secondaryHits.length * 5),
    engagement: calculateEngagementScore(workshop.registrationCount ?? 0),
  };

  if (primaryInterestMatch) {
    reasons.push("Matches one of your interests");
  }
  if (profile.domain && workshop.domain && normalize(profile.domain) === normalize(workshop.domain)) {
    reasons.push("Academic domain matches");
  }
  if (
    profile.departmentName &&
    workshop.departmentName &&
    normalize(profile.departmentName) === normalize(workshop.departmentName)
  ) {
    breakdown.departmentMatch = 30;
    reasons.push("Department matches");
  } else if (!workshop.departmentName) {
    breakdown.departmentMatch = 15;
    reasons.push("Open to all departments");
  }

  if (secondaryHits.length > 0) {
    reasons.push(`Related to ${secondaryHits.slice(0, 2).join(" and ")}`);
  }

  if (breakdown.engagement > 0) {
    reasons.push("Popular with other participants");
  }

  const score = breakdown.interestMatch + breakdown.departmentMatch + breakdown.secondaryRelevance + breakdown.engagement;
  return { score: Math.min(100, score), reasons, breakdown };
}
