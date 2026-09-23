import { DEFAULT_CERTIFICATE_MIN_PERCENT } from "../constants";

export function calculateAttendancePercentage(attended: number, total: number): number {
  if (total <= 0) return 0;
  if (attended < 0) return 0;
  const safeAttended = Math.min(attended, total);
  return Math.round((safeAttended / total) * 10000) / 100;
}

export function isCertificateEligible(
  percentage: number,
  minimum = DEFAULT_CERTIFICATE_MIN_PERCENT,
): boolean {
  return percentage >= minimum;
}
