import type { AcademicDomain, AcademicYear, PreferredLanguage } from "@prisma/client";

export type ProfileUpdate = {
  firstName?: string;
  lastName?: string;
  preferredLanguage?: PreferredLanguage;
  institution: string;
  domain: AcademicDomain;
  departmentName?: string;
  year?: AcademicYear;
  interests: string[];
  organizationId?: string | null;
  departmentId?: string | null;
};
