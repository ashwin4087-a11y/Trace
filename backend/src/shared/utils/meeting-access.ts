export function canSeeMeetingLinks(input: {
  role?: string;
  userId?: string;
  organizerId: string;
  registrationStatus?: string | null;
}): boolean {
  if (input.role === "ADMIN") return true;
  if (input.userId && input.userId === input.organizerId) return true;
  // Participants must never see meeting links through general APIs.
  // They must use the secure /access endpoint after attendance verification.
  return false;
}
