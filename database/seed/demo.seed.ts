import { PERMISSIONS, ROLE_PERMISSIONS } from "../../backend/src/shared/constants";
import { prisma } from "./client";

export async function seedAccessControl() {
  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: { description: permission.description },
      create: permission,
    });
  }
  const descriptions = {
    ADMIN: "Platform administrator",
    ORGANIZER: "Workshop organizer",
    PARTICIPANT: "Learner",
  } as const;
  for (const name of ["ADMIN", "ORGANIZER", "PARTICIPANT"] as const) {
    const role = await prisma.role.upsert({
      where: { name },
      update: { description: descriptions[name] },
      create: { name, description: descriptions[name] },
    });
    const keys = ROLE_PERMISSIONS[name];
    const permissions = await prisma.permission.findMany({ where: { key: { in: keys } } });
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    if (permissions.length) {
      await prisma.rolePermission.createMany({
        data: permissions.map((permission) => ({ roleId: role.id, permissionId: permission.id })),
      });
    }
  }
  await prisma.platformSetting.upsert({
    where: { id: "platform" },
    update: {},
    create: {
      id: "platform",
      platformName: "AUREX LMS",
      defaultLanguage: "EN",
      supportedLanguages: ["EN", "TA", "EN_TA"],
      timezone: "Asia/Kolkata",
      certificateMinPercent: 90,
    },
  });
}

export async function seedLearningPath(workshopId: string) {
  const existing = await prisma.learningPath.findFirst({ where: { title: "Cybersecurity Beginner Path" } });
  if (existing) return;
  await prisma.learningPath.create({
    data: {
      title: "Cybersecurity Beginner Path",
      description: "Start with Linux fundamentals. Later workshops can be appended to this path.",
      domain: "ENGINEERING",
      status: "PUBLISHED",
      steps: { create: [{ workshopId, position: 0 }] },
    },
  });
}
