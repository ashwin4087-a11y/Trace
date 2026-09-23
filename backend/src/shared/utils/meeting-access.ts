export function canSeeMeetingLinks(input: {
  role?: string;
  userId?: string;
  organizerId: string;
  registrationStatus?: string | null;
}): boolean {
  if (input.role === "ADMIN") return true;
  if (input.userId && input.userId === input.organizerId) return true;
  return input.registrationStatus === "CONFIRMED";
}
