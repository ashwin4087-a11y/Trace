import type { RegistrationStatus } from "@prisma/client";

export type RegistrationResult = {
  id: string;
  status: RegistrationStatus;
  workshopId: string;
};
