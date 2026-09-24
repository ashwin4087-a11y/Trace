export function canSeeMeetingLinks(input: {
  role?: string;
  userId?: string;
  organizerId: string;
  registrationStatus?: string | null;
  attendanceStatus?: string | null;
}): boolean {
  if (input.role === "ADMIN") return true;
  if (input.userId && input.userId === input.organizerId) return true;
  
  if (input.role === "PARTICIPANT") {
    // Participants must only see meeting links after successful check-in
    return input.registrationStatus === "CONFIRMED" && input.attendanceStatus === "PRESENT";
  }
  
  return false;
}
