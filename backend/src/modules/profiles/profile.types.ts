import type { AcademicDomain, PreferredLanguage } from "@prisma/client";

export type ProfileUpdate = {
  firstName?: string;
  lastName?: string;
  preferredLanguage?: PreferredLanguage;
  institution: string;
  domain: AcademicDomain;
  departmentName?: string;
  year?: number;
  interests: string[];
  organizationId?: string | null;
  departmentId?: string | null;
};
