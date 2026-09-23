import { prisma } from "../../config/database";
import { scoreWorkshop } from "../../shared/utils/recommendations";

export async function recommendForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      academicProfile: true,
      interests: true,
      skills: { include: { skill: true } },
      department: true,
      registrations: true,
      certificates: true,
    },
  });
  if (!user) return [];
  const completed = new Set(user.certificates.map((item) => item.workshopId));
  const registered = new Set(user.registrations.filter((item) => item.status !== "CANCELLED").map((item) => item.workshopId));
  const workshops = await prisma.workshop.findMany({
    where: { status: { in: ["PUBLISHED", "REGISTRATION_OPEN"] } },
    include: {
      workshopSkills: { include: { skill: true } },
      department: true,
      _count: { select: { registrations: true } },
    },
  });

  const ranked = workshops
    .filter((workshop) => !completed.has(workshop.id) && !registered.has(workshop.id))
    .map((workshop) => {
      const scored = scoreWorkshop(
        {
          domain: user.academicProfile?.domain,
          departmentName: user.academicProfile?.departmentName ?? user.department?.name,
          year: user.academicProfile?.year,
          skills: user.skills.map((item) => item.skill.name),
          interests: user.interests.map((item) => item.label),
          language: user.preferredLanguage,
        },
        {
          id: workshop.id,
          domain: workshop.domain!,
          departmentName: workshop.department?.name,
          level: workshop.level!,
          language: workshop.language!,
          skills: workshop.workshopSkills.map((item) => item.skill.name),
          category: workshop.category!,
          title: workshop.title,
          registrationCount: workshop._count?.registrations ?? 0,
        },
      );
      return { workshop, ...scored };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  await Promise.all(
    ranked.map((item) =>
      prisma.recommendation.upsert({
        where: { userId_workshopId: { userId, workshopId: item.workshop.id } },
        update: { score: item.score, reasons: item.reasons },
        create: { userId, workshopId: item.workshop.id, score: item.score, reasons: item.reasons },
      }),
    ),
  );

  return ranked.map((item) => ({
    workshop: item.workshop,
    score: item.score,
    reasons: item.reasons,
  }));
}
