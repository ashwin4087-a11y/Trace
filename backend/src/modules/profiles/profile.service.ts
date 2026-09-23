import type { AcademicDomain, AcademicPreferredLanguage, AcademicYear } from "@prisma/client";
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
      name: user.name,
      phone: user.phone,
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

export async function getProfileOptions(organizationId?: string) {
  const organizations = await prisma.organization.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, code: true },
    orderBy: { name: "asc" },
  });
  const departments = await prisma.department.findMany({
    where: { status: "ACTIVE", ...(organizationId ? { organizationId } : {}) },
    select: { id: true, organizationId: true, name: true, code: true },
    orderBy: { name: "asc" },
  });
  return { organizations, departments };
}

export async function upsertMyProfile(
  userId: string,
  input: {
    name?: string | null;
    phone?: string | null;
    firstName?: string;
    lastName?: string;
    preferredLanguage?: "EN" | "TA" | "EN_TA";
    institution: string;
    domain: AcademicDomain;
    departmentName?: string;
    year?: AcademicYear;
    interests: string[];
    skills: string[];
    academicPreferredLanguage?: AcademicPreferredLanguage;
    organizationId?: string | null;
    departmentId?: string | null;
  },
) {
  if ((input.organizationId && !input.departmentId) || (!input.organizationId && input.departmentId)) {
    throw new ApiError(400, "PROFILE_PLACEMENT_INCOMPLETE", "Organization and department must be selected together");
  }
  if (input.organizationId && input.departmentId) {
    const organization = await prisma.organization.findUnique({ where: { id: input.organizationId } });
    if (!organization) throw new ApiError(404, "ORGANIZATION_NOT_FOUND", "Organization not found");
    if (organization.status !== "ACTIVE") throw new ApiError(409, "ORGANIZATION_INACTIVE", "Select an active organization");
    const department = await prisma.department.findUnique({ where: { id: input.departmentId } });
    if (!department) throw new ApiError(404, "DEPARTMENT_NOT_FOUND", "Department not found");
    if (department.organizationId !== input.organizationId) throw new ApiError(400, "DEPARTMENT_ORGANIZATION_MISMATCH", "Department does not belong to the selected organization");
    if (department.status !== "ACTIVE") throw new ApiError(409, "DEPARTMENT_INACTIVE", "Select an active department");
  }
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        phone: input.phone,
        firstName: input.firstName,
        lastName: input.lastName,
        preferredLanguage: input.preferredLanguage,
        organizationId: input.organizationId,
        departmentId: input.departmentId,
      },
    });
    if (input.organizationId && input.departmentId) {
      await tx.organizationMember.upsert({
        where: { organizationId_userId: { organizationId: input.organizationId, userId } },
        update: { departmentId: input.departmentId },
        create: { organizationId: input.organizationId, userId, departmentId: input.departmentId },
      });
    } else {
      await tx.organizationMember.deleteMany({ where: { userId } });
    }
    await tx.academicProfile.upsert({
      where: { userId },
      create: {
        userId,
        institution: input.institution,
        domain: input.domain,
        departmentName: input.departmentName,
        year: input.year,
        preferredLanguage: input.academicPreferredLanguage,
      },
      update: {
        institution: input.institution,
        domain: input.domain,
        departmentName: input.departmentName,
        year: input.year,
        preferredLanguage: input.academicPreferredLanguage,
      },
    });
    await tx.userInterest.deleteMany({ where: { userId } });
    if (input.interests.length) {
      await tx.userInterest.createMany({
        data: input.interests.map((label) => ({ userId, label: label.trim() })).filter((item) => item.label),
      });
    }
    const skillNames = [...new Set(input.skills.map((skill) => skill.trim()).filter(Boolean))];
    const skillRecords = await Promise.all(skillNames.map((name) => tx.skill.upsert({ where: { name }, update: {}, create: { name } })));
    await tx.userSkill.deleteMany({ where: { userId, verified: false, skillId: { notIn: skillRecords.map((skill) => skill.id) } } });
    for (const skill of skillRecords) {
      await tx.userSkill.upsert({
        where: { userId_skillId: { userId, skillId: skill.id } },
        update: {},
        create: { userId, skillId: skill.id },
      });
    }
  });
  return getMyProfile(userId);
}
