import type { AcademicDomain, DeliveryMode, PreferredLanguage, ProficiencyLevel, WorkshopStatus } from "@prisma/client";

export type WorkshopWriteInput = {
  title: string;
  description: string;
  category: string;
  domain: AcademicDomain;
  departmentId?: string | null;
  level: ProficiencyLevel;
  skills?: string[];
  trainerName: string;
  startDate: string;
  endDate: string;
  durationHours: number;
  mode: DeliveryMode;
  capacity: number;
  waitlistEnabled?: boolean;
  registrationDeadline: string;
  language: PreferredLanguage;
  meetingUrl?: string | null;
  venue?: string | null;
  priceCents?: number;
  currency?: string;
  status?: WorkshopStatus;
};
