import { describe, expect, it } from "vitest";
import { calculateAttendancePercentage, isCertificateEligible } from "../../../backend/src/shared/utils/attendance";

describe("attendance percentage", () => {
  it("returns 0 when a workshop has no sessions", () => {
    expect(calculateAttendancePercentage(0, 0)).toBe(0);
  });

  it("rounds to two decimal places", () => {
    expect(calculateAttendancePercentage(2, 3)).toBe(66.67);
  });

  it("caps attended sessions at the session total", () => {
    expect(calculateAttendancePercentage(5, 2)).toBe(100);
  });
});

describe("certificate eligibility", () => {
  it("rejects attendance below 90 percent", () => {
    expect(isCertificateEligible(89.99)).toBe(false);
  });

  it("accepts attendance at the 90 percent boundary", () => {
    expect(isCertificateEligible(90)).toBe(true);
  });
});
