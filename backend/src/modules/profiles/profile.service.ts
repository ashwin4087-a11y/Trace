import type { AcademicDomain, AcademicYear } from "@prisma/client";
import { prisma } from "../../config/database";
import { ApiError } from "../../shared/errors/api-error";

export async function getMyProfile(userId: string) {
  const [user, profile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        interests: true,
        skills: { include: { skill: true } },
        organization: true,
        department: true,
      },
    }),
    prisma.academicProfile.findUnique({ where: { userId } }),
  ]);
  if (!user) throw new ApiError(404, "NOT_FOUND", "User not found");
  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      preferredLanguage: user.preferredLanguage,
      organization: user.organization,
      department: user.department,
    },
    academicProfile: profile,
    interests: user.interests.map((item) => item.label),
    skills: user.skills.map((item) => ({
      id: item.skillId,
      name: item.skill.name,
      level: item.level,
      verified: item.verified,
    })),
  };
}

export async function upsertMyProfile(
  userId: string,
  input: {
    firstName?: string;
    lastName?: string;
    preferredLanguage?: "EN" | "TA" | "EN_TA";
    institution: string;
    domain: AcademicDomain;
    departmentName?: string;
    year?: AcademicYear;
    interests: string[];
    organizationId?: string | null;
    departmentId?: string | null;
  },
) {
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        preferredLanguage: input.preferredLanguage,
        organizationId: input.organizationId,
        departmentId: input.departmentId,
      },
    });
    await tx.academicProfile.upsert({
      where: { userId },
      create: {
        userId,
        institution: input.institution,
        domain: input.domain,
        departmentName: input.departmentName,
        year: input.year,
      },
      update: {
        institution: input.institution,
        domain: input.domain,
        departmentName: input.departmentName,
        year: input.year,
      },
    });
    await tx.userInterest.deleteMany({ where: { userId } });
    if (input.interests.length) {
      await tx.userInterest.createMany({
        data: input.interests.map((label) => ({ userId, label: label.trim() })).filter((item) => item.label),
      });
    }
  });
  return getMyProfile(userId);
}
