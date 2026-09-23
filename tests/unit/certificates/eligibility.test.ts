import { describe, expect, it } from "vitest";
import { isCertificateEligible } from "../../../backend/src/shared/utils/attendance";

describe("certificate gate", () => {
  it("keeps generation blocked until the backend threshold is met", () => {
    expect(isCertificateEligible(89, 90)).toBe(false);
    expect(isCertificateEligible(90, 90)).toBe(true);
  });
});
