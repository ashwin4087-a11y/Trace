import { describe, expect, it } from "vitest";
import { decideRegistration } from "../../../backend/src/shared/utils/registration-rules";

const base = {
  workshopStatus: "PUBLISHED",
  deadline: new Date("2026-12-01T00:00:00.000Z"),
  now: new Date("2026-09-01T00:00:00.000Z"),
  confirmedCount: 0,
  capacity: 2,
  waitlistEnabled: true,
  priceCents: 0,
};

describe("registration decisions", () => {
  it("confirms a free seat", () => {
    expect(decideRegistration(base)).toEqual({ ok: true, status: "CONFIRMED" });
  });

  it("requires payment before confirmation", () => {
    expect(decideRegistration({ ...base, priceCents: 50000 }).status).toBe("PENDING_PAYMENT");
  });

  it("waitlists only when capacity is reached and waitlist is enabled", () => {
    expect(decideRegistration({ ...base, confirmedCount: 2 })).toEqual({ ok: true, status: "WAITLISTED" });
    expect(decideRegistration({ ...base, confirmedCount: 2, waitlistEnabled: false })).toEqual({
      ok: false,
      reason: "CAPACITY_REACHED",
    });
  });

  it("stops after the deadline", () => {
    expect(decideRegistration({ ...base, now: new Date("2026-12-02T00:00:00.000Z") })).toEqual({
      ok: false,
      reason: "DEADLINE_PASSED",
    });
  });
});
