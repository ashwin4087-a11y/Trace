import { prisma } from "../../config/database";

export async function listSkills() {
  return prisma.skill.findMany({ orderBy: { name: "asc" } });
}

export async function passport(userId: string) {
  const skills = await prisma.userSkill.findMany({
    where: { userId },
    include: { skill: true, evidence: { include: { workshop: { select: { title: true } } } } },
  });
  const certificates = await prisma.certificate.findMany({
    where: { userId, status: "ISSUED" },
    include: { workshop: { include: { workshopSkills: { include: { skill: true } } } } },
  });
  return { skills, certificates };
}

export async function addSkill(userId: string, input: { name: string; level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" }) {
  const skill = await prisma.skill.upsert({
    where: { name: input.name },
    update: {},
    create: { name: input.name },
  });
  return prisma.userSkill.upsert({
    where: { userId_skillId: { userId, skillId: skill.id } },
    update: { level: input.level },
    create: { userId, skillId: skill.id, level: input.level },
    include: { skill: true },
  });
}
