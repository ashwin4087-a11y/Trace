export type RegistrationDecision =
  | { ok: true; status: "CONFIRMED" | "WAITLISTED" | "PENDING_PAYMENT" }
  | { ok: false; reason: "NOT_PUBLISHED" | "DEADLINE_PASSED" | "CAPACITY_REACHED" };

export function decideRegistration(input: {
  workshopStatus: string;
  deadline: Date;
  now: Date;
  confirmedCount: number;
  capacity: number;
  waitlistEnabled: boolean;
  priceCents: number;
}): RegistrationDecision {
  if (input.workshopStatus !== "PUBLISHED") {
    return { ok: false, reason: "NOT_PUBLISHED" };
  }
  if (input.now.getTime() > input.deadline.getTime()) {
    return { ok: false, reason: "DEADLINE_PASSED" };
  }
  if (input.confirmedCount >= input.capacity) {
    if (!input.waitlistEnabled) {
      return { ok: false, reason: "CAPACITY_REACHED" };
    }
    return { ok: true, status: "WAITLISTED" };
  }
  if (input.priceCents > 0) {
    return { ok: true, status: "PENDING_PAYMENT" };
  }
  return { ok: true, status: "CONFIRMED" };
}
