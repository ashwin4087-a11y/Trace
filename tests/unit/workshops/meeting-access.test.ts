import { describe, expect, it } from "vitest";
import { canSeeMeetingLinks } from "../../../backend/src/shared/utils/meeting-access";

describe("meeting link access", () => {
  const organizerId = "organizer-1";

  it("shows links to the owning organizer and to admins", () => {
    expect(canSeeMeetingLinks({ role: "ORGANIZER", userId: organizerId, organizerId })).toBe(true);
    expect(canSeeMeetingLinks({ role: "ADMIN", userId: "admin", organizerId })).toBe(true);
  });

  it("shows links only to a confirmed participant who has checked in", () => {
    expect(
      canSeeMeetingLinks({
        role: "PARTICIPANT",
        userId: "learner",
        organizerId,
        registrationStatus: "CONFIRMED",
        attendanceStatus: "PRESENT",
      }),
    ).toBe(true);
    expect(
      canSeeMeetingLinks({
        role: "PARTICIPANT",
        userId: "learner",
        organizerId,
        registrationStatus: "CONFIRMED",
        attendanceStatus: null,
      }),
    ).toBe(false);
    expect(
      canSeeMeetingLinks({
        role: "PARTICIPANT",
        userId: "learner",
        organizerId,
        registrationStatus: "WAITLISTED",
        attendanceStatus: "PRESENT",
      }),
    ).toBe(false);
  });

  it("hides links from anonymous visitors", () => {
    expect(canSeeMeetingLinks({ organizerId })).toBe(false);
  });
});
