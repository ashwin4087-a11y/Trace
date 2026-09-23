import { describe, it, expect } from "vitest";
import { calculateInactiveIntervals, MinimalEvent } from "../../src/shared/utils/attendance";

describe("calculateInactiveIntervals", () => {
  const sessionStart = new Date("2026-09-24T10:00:00.000Z");
  const sessionEnd = new Date("2026-09-24T12:00:00.000Z"); // 2 hours

  it("Full attendance (No violations)", () => {
    const events: MinimalEvent[] = [];
    const inactive = calculateInactiveIntervals(events, sessionStart, sessionEnd, 10);
    expect(inactive).toBe(0);
  });

  it("10-second violation inside grace period (10s)", () => {
    const events: MinimalEvent[] = [
      { type: "TAB_HIDDEN", serverTime: new Date("2026-09-24T10:05:00.000Z") },
      { type: "TAB_VISIBLE", serverTime: new Date("2026-09-24T10:05:07.000Z") } // 7 seconds
    ];
    const inactive = calculateInactiveIntervals(events, sessionStart, sessionEnd, 10);
    expect(inactive).toBe(0);
  });

  it("30-second violation with 10s grace period", () => {
    const events: MinimalEvent[] = [
      { type: "FOCUS_LOST", serverTime: new Date("2026-09-24T10:10:00.000Z") },
      { type: "FOCUS_REGAINED", serverTime: new Date("2026-09-24T10:10:30.000Z") } // 30 seconds
    ];
    const inactive = calculateInactiveIntervals(events, sessionStart, sessionEnd, 10);
    expect(inactive).toBe(20000); // 20 seconds
  });

  it("Overlapping events should merge", () => {
    const events: MinimalEvent[] = [
      { type: "TAB_HIDDEN", serverTime: new Date("2026-09-24T10:00:00.000Z") },
      { type: "FOCUS_LOST", serverTime: new Date("2026-09-24T10:05:00.000Z") },
      { type: "FULLSCREEN_EXIT", serverTime: new Date("2026-09-24T10:10:00.000Z") },
      { type: "TAB_VISIBLE", serverTime: new Date("2026-09-24T10:20:00.000Z") },
      { type: "FOCUS_REGAINED", serverTime: new Date("2026-09-24T10:20:00.000Z") },
      { type: "FULLSCREEN_ENTER", serverTime: new Date("2026-09-24T10:20:00.000Z") }
    ];
    const inactive = calculateInactiveIntervals(events, sessionStart, sessionEnd, 10);
    expect(inactive).toBe((20 * 60 - 10) * 1000); 
  });

  it("Event begins before session starts", () => {
    const events: MinimalEvent[] = [
      { type: "TAB_HIDDEN", serverTime: new Date("2026-09-24T09:50:00.000Z") },
      { type: "TAB_VISIBLE", serverTime: new Date("2026-09-24T10:10:00.000Z") }
    ];
    const inactive = calculateInactiveIntervals(events, sessionStart, sessionEnd, 0); 
    expect(inactive).toBe(10 * 60 * 1000);
  });

  it("Event ends after session ends", () => {
    const events: MinimalEvent[] = [
      { type: "TAB_HIDDEN", serverTime: new Date("2026-09-24T11:50:00.000Z") },
      { type: "TAB_VISIBLE", serverTime: new Date("2026-09-24T12:20:00.000Z") }
    ];
    const inactive = calculateInactiveIntervals(events, sessionStart, sessionEnd, 0);
    expect(inactive).toBe(10 * 60 * 1000);
  });

  it("Never recovered", () => {
    const events: MinimalEvent[] = [
      { type: "TAB_HIDDEN", serverTime: new Date("2026-09-24T11:00:00.000Z") }
    ];
    const inactive = calculateInactiveIntervals(events, sessionStart, sessionEnd, 0);
    expect(inactive).toBe(60 * 60 * 1000);
  });

  it("Invalid session", () => {
    const events: MinimalEvent[] = [];
    const inactive = calculateInactiveIntervals(events, sessionEnd, sessionStart, 10);
    expect(inactive).toBe(0);
  });
});
