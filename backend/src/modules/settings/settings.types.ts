import type { PreferredLanguage } from "@prisma/client";

export type SettingsUpdate = {
  platformName?: string;
  defaultLanguage?: PreferredLanguage;
  supportedLanguages?: PreferredLanguage[];
  timezone?: string;
  registrationOpen?: boolean;
  certificateMinPercent?: number;
  notificationsEnabled?: boolean;
  maintenanceMode?: boolean;
};
