import { prisma } from "./client";

export async function seedOrganizations(organizerId: string, participantId: string) {
  const organization = await prisma.organization.upsert({
    where: { code: "AUREX" },
    update: {},
    create: {
      name: "AUREX Institute of Technology",
      code: "AUREX",
      description: "Host institution for the 2026 lifelong learning workshops.",
    },
  });
  const department = await prisma.department.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: "CSE" } },
    update: {},
    create: {
      organizationId: organization.id,
      name: "Computer Science",
      code: "CSE",
    },
  });
  await prisma.user.update({
    where: { id: organizerId },
    data: { organizationId: organization.id, departmentId: department.id },
  });
  await prisma.user.update({
    where: { id: participantId },
    data: { organizationId: organization.id, departmentId: department.id },
  });
  return { organization, department };
}
