import { describe, expect, it } from "vitest";
import { normalizeMeetingUrl } from "../../../backend/src/integrations/meetings/meeting.provider";

describe("meeting links", () => {
  it("accepts an https Google Meet link", () => {
    expect(normalizeMeetingUrl("https://meet.google.com/abc-defg-hij").provider).toBe("meet.google.com");
  });

  it("rejects non-https links", () => {
    expect(() => normalizeMeetingUrl("http://meet.google.com/abc")).toThrow(/https/);
  });
});
