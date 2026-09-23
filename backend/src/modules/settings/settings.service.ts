import { prisma } from "../../config/database";

const defaults = {
  id: "platform",
  platformName: "AUREX LMS",
  defaultLanguage: "EN" as const,
  supportedLanguages: ["EN", "TA", "EN_TA"] as ("EN" | "TA" | "EN_TA")[],
  timezone: "Asia/Kolkata",
  registrationOpen: true,
  certificateMinPercent: 90,
  notificationsEnabled: true,
  maintenanceMode: false,
  traceSignatoryName: "PROGRAMME DIRECTOR",
  traceSignatoryTitle: "TRACE Academia",
};

export async function getSettings() {
  return prisma.platformSetting.upsert({
    where: { id: "platform" },
    update: {},
    create: defaults,
  });
}

export async function updateSettings(input: Partial<Omit<typeof defaults, "id">>) {
  await getSettings();
  return prisma.platformSetting.update({
    where: { id: "platform" },
    data: input,
  });
}

let maintenanceCache: { at: number; value: boolean } | null = null;

export async function isMaintenanceMode(): Promise<boolean> {
  if (maintenanceCache && Date.now() - maintenanceCache.at < 15_000) {
    return maintenanceCache.value;
  }
  try {
    const settings = await prisma.platformSetting.findUnique({ where: { id: "platform" } });
    const value = settings?.maintenanceMode ?? false;
    maintenanceCache = { at: Date.now(), value };
    return value;
  } catch {
    return false;
  }
}
