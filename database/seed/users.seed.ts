import type { AcademicDomain, PreferredLanguage } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "./client";

export async function seedUsers(passwords: { admin: string; organizer: string; participant: string }) {
  const admin = await prisma.user.upsert({
    where: { email: process.env.SEED_ADMIN_EMAIL || "admin@aurex.local" },
    update: {},
    create: {
      email: process.env.SEED_ADMIN_EMAIL || "admin@aurex.local",
      passwordHash: await bcrypt.hash(passwords.admin, 12),
      firstName: "Aurex",
      lastName: "Admin",
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      preferredLanguage: "EN",
      notificationPreference: { create: {} },
    },
  });

  const organizer = await prisma.user.upsert({
    where: { email: process.env.SEED_ORGANIZER_EMAIL || "organizer@aurex.local" },
    update: {},
    create: {
      email: process.env.SEED_ORGANIZER_EMAIL || "organizer@aurex.local",
      passwordHash: await bcrypt.hash(passwords.organizer, 12),
      firstName: "Meena",
      lastName: "Organizer",
      role: "ORGANIZER",
      status: "ACTIVE",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      preferredLanguage: "EN_TA",
      notificationPreference: { create: {} },
    },
  });

  const participant = await prisma.user.upsert({
    where: { email: process.env.SEED_PARTICIPANT_EMAIL || "participant@aurex.local" },
    update: {},
    create: {
      email: process.env.SEED_PARTICIPANT_EMAIL || "participant@aurex.local",
      passwordHash: await bcrypt.hash(passwords.participant, 12),
      firstName: "Arun",
      lastName: "Kumar",
      role: "PARTICIPANT",
      status: "ACTIVE",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      preferredLanguage: "TA",
      notificationPreference: { create: {} },
    },
  });

  for (const user of [admin, organizer, participant]) {
    const role = await prisma.role.findUnique({ where: { name: user.role } });
    if (!role) throw new Error(`Missing role seed for ${user.role}`);
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
      update: {},
      create: { userId: user.id, roleId: role.id },
    });
  }

  return { admin, organizer, participant };
}

export async function seedProfile(userId: string, domain: AcademicDomain, language: PreferredLanguage) {
  await prisma.academicProfile.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      institution: "AUREX Institute",
      domain,
      departmentName: "Computer Science",
      year: "SECOND",
    },
  });
  await prisma.user.update({ where: { id: userId }, data: { preferredLanguage: language } });
  const labels = ["Cybersecurity", "Linux"];
  for (const label of labels) {
    await prisma.userInterest.upsert({
      where: { userId_label: { userId, label } },
      update: {},
      create: { userId, label },
    });
  }
}
