import { prisma } from "./client";

export async function seedWorkshop(organizerId: string, departmentId: string) {
  const existing = await prisma.workshop.findFirst({ where: { title: "Linux Fundamentals for Cybersecurity" } });
  if (existing) return existing;

  const linux = await prisma.skill.upsert({
    where: { name: "Linux" },
    update: {},
    create: { name: "Linux", category: "Cybersecurity" },
  });
  const networking = await prisma.skill.upsert({
    where: { name: "Networking" },
    update: {},
    create: { name: "Networking", category: "Cybersecurity" },
  });

  const start = new Date();
  start.setDate(start.getDate() + 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 2);

  return prisma.workshop.create({
    data: {
      organizerId,
      departmentId,
      title: "Linux Fundamentals for Cybersecurity",
      slug: "linux-fundamentals-for-cybersecurity",
      description: "A hands-on beginner workshop covering the Linux shell, users, permissions, and basic network tools.",
      category: "Cybersecurity",
      domain: "ENGINEERING",
      level: "BEGINNER",
      trainerName: "Meena Organizer",
      startDate: start,
      endDate: end,
      durationHours: 12,
      mode: "ONLINE",
      capacity: 40,
      waitlistEnabled: true,
      registrationDeadline: start,
      language: "EN_TA",
      meetingUrl: "https://meet.google.com/aurex-linux-demo",
      meetingProvider: "meet.google.com",
      priceCents: 0,
      currency: "INR",
      status: "PUBLISHED",
      workshopSkills: { create: [{ skillId: linux.id }, { skillId: networking.id }] },
      community: {
        create: {
          name: "Linux Fundamentals community",
          description: "Questions and resources for the Linux workshop.",
        },
      },
    },
  });
}
