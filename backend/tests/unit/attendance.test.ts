import { describe, it, expect } from "vitest";
import { calculateInactiveIntervals, MinimalEvent, getSessionDurationMs, calculateAttendancePercentage, calculateAttendance, AttendanceConfig } from "../../src/shared/utils/attendance";

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

describe("getSessionDurationMs", () => {
  it("1h session", () => {
    const duration = getSessionDurationMs({
      startTime: new Date("2026-09-24T10:00:00Z"),
      endTime: new Date("2026-09-24T11:00:00Z")
    });
    expect(duration).toBe(60 * 60 * 1000);
  });

  it("3h session", () => {
    const duration = getSessionDurationMs({
      startTime: new Date("2026-09-24T10:00:00Z"),
      endTime: new Date("2026-09-24T13:00:00Z")
    });
    expect(duration).toBe(3 * 60 * 60 * 1000);
  });

  it("30min session", () => {
    const duration = getSessionDurationMs({
      startTime: new Date("2026-09-24T10:00:00Z"),
      endTime: new Date("2026-09-24T10:30:00Z")
    });
    expect(duration).toBe(30 * 60 * 1000);
  });

  it("end before start throws error", () => {
    expect(() => getSessionDurationMs({
      startTime: new Date("2026-09-24T12:00:00Z"),
      endTime: new Date("2026-09-24T10:00:00Z")
    })).toThrow("Session end time must be after start time");
  });

  it("zero duration throws error", () => {
    expect(() => getSessionDurationMs({
      startTime: new Date("2026-09-24T10:00:00Z"),
      endTime: new Date("2026-09-24T10:00:00Z")
    })).toThrow("Session end time must be after start time");
  });
});

describe("calculateAttendancePercentage", () => {
  it("full attendance = 100%", () => {
    expect(calculateAttendancePercentage(120, 120)).toBe(100);
  });

  it("about 50%", () => {
    expect(calculateAttendancePercentage(60, 120)).toBe(50);
    expect(calculateAttendancePercentage(61, 120)).toBe(50.83);
  });

  it("never above 100%", () => {
    expect(calculateAttendancePercentage(150, 120)).toBe(100);
  });
  
  it("never below 0%", () => {
    expect(calculateAttendancePercentage(-10, 120)).toBe(0);
  });
  
  it("zero duration handled safely", () => {
    expect(calculateAttendancePercentage(60, 0)).toBe(0);
  });
});

describe("calculateAttendance", () => {
  const sessionStart = new Date("2026-09-24T10:00:00Z");
  const sessionEnd = new Date("2026-09-24T13:00:00Z"); // 180 min
  const config: AttendanceConfig = {
    fullscreenGraceMs: 10000,
    focusGraceMs: 10000,
    heartbeatIntervalMs: 30000,
    heartbeatGapMultiplier: 3
  };

  it("20-minute inactivity = 160/180 = 88.89%", () => {
    // 20 min = 1200000 ms. We'll make a gap of 20 min + 10s grace.
    const events: MinimalEvent[] = [
      { type: "CHECK_IN", serverTime: new Date("2026-09-24T10:00:00Z") },
      { type: "TAB_HIDDEN", serverTime: new Date("2026-09-24T11:00:00Z") },
      { type: "TAB_VISIBLE", serverTime: new Date("2026-09-24T11:20:10Z") }
    ];
    // A single heartbeat gap from check-in to end is large, but we'll add heartbeats to prevent heartbeat gaps from dominating.
    const hbEvents: MinimalEvent[] = [];
    for (let i = 0; i <= 180; i++) {
      hbEvents.push({ type: "HEARTBEAT", serverTime: new Date(sessionStart.getTime() + i * 60000) });
    }
    const pct = calculateAttendance({
      sessionWindow: { start: sessionStart, end: sessionEnd },
      checkInAt: sessionStart,
      events: [...events, ...hbEvents],
      config
    });
    // 180 mins total. 20 mins exactly docked. 160/180 = 88.89.
    expect(pct).toBe(88.89);
  });

  it("overlapping events counted once", () => {
    const events: MinimalEvent[] = [
      { type: "CHECK_IN", serverTime: new Date("2026-09-24T10:00:00Z") },
      { type: "TAB_HIDDEN", serverTime: new Date("2026-09-24T11:00:00Z") },
      { type: "FOCUS_LOST", serverTime: new Date("2026-09-24T11:05:00Z") },
      { type: "TAB_VISIBLE", serverTime: new Date("2026-09-24T11:20:10Z") },
      { type: "FOCUS_REGAINED", serverTime: new Date("2026-09-24T11:20:10Z") }
    ];
    const hbEvents: MinimalEvent[] = [];
    for (let i = 0; i <= 180; i++) hbEvents.push({ type: "HEARTBEAT", serverTime: new Date(sessionStart.getTime() + i * 60000) });
    
    const pct = calculateAttendance({
      sessionWindow: { start: sessionStart, end: sessionEnd },
      checkInAt: sessionStart,
      events: [...events, ...hbEvents],
      config
    });
    expect(pct).toBe(88.89);
  });

  it("short interruption inside grace ignored", () => {
    const events: MinimalEvent[] = [
      { type: "CHECK_IN", serverTime: new Date("2026-09-24T10:00:00Z") },
      { type: "TAB_HIDDEN", serverTime: new Date("2026-09-24T11:00:00Z") },
      { type: "TAB_VISIBLE", serverTime: new Date("2026-09-24T11:00:05Z") } // 5s gap
    ];
    const hbEvents: MinimalEvent[] = [];
    for (let i = 0; i <= 180; i++) hbEvents.push({ type: "HEARTBEAT", serverTime: new Date(sessionStart.getTime() + i * 60000) });
    
    const pct = calculateAttendance({
      sessionWindow: { start: sessionStart, end: sessionEnd },
      checkInAt: sessionStart,
      events: [...events, ...hbEvents],
      config
    });
    expect(pct).toBe(100.00);
  });

  it("late joiner credited from check-in only", () => {
    const checkIn = new Date("2026-09-24T11:30:00Z"); // 90 min late
    const events: MinimalEvent[] = [
      { type: "CHECK_IN", serverTime: checkIn }
    ];
    const hbEvents: MinimalEvent[] = [];
    for (let i = 90; i <= 180; i++) hbEvents.push({ type: "HEARTBEAT", serverTime: new Date(sessionStart.getTime() + i * 60000) });
    
    const pct = calculateAttendance({
      sessionWindow: { start: sessionStart, end: sessionEnd },
      checkInAt: checkIn,
      events: [...events, ...hbEvents],
      config
    });
    // Missed 90 mins. 90/180 = 50%
    expect(pct).toBe(50.00);
  });

  it("heartbeat gap capped", () => {
    // Session is 3h. Heartbeat at 10:00, gap until 11:00, then heartbeats until 13:00.
    const events: MinimalEvent[] = [
      { type: "CHECK_IN", serverTime: sessionStart }
    ];
    // Gap max is 30s * 3 = 90s.
    // 10:00 to 11:00 is a 60 min gap.
    // Inactive interval starts at 10:01:30 and ends at 11:00:00 = 58.5 mins inactive.
    const hbEvents: MinimalEvent[] = [];
    for (let i = 60; i <= 180; i++) hbEvents.push({ type: "HEARTBEAT", serverTime: new Date(sessionStart.getTime() + i * 60000) });
    
    const pct = calculateAttendance({
      sessionWindow: { start: sessionStart, end: sessionEnd },
      checkInAt: sessionStart,
      events: [...events, ...hbEvents],
      config
    });
    // 180 min total. 58.5 min gap. 121.5 / 180 = 67.50%
    expect(pct).toBe(67.50);
  });

  it("never above 100", () => {
    const events: MinimalEvent[] = [
      { type: "CHECK_IN", serverTime: new Date("2026-09-24T09:00:00Z") } // 1h early!
    ];
    const hbEvents: MinimalEvent[] = [];
    for (let i = -60; i <= 180; i++) hbEvents.push({ type: "HEARTBEAT", serverTime: new Date(sessionStart.getTime() + i * 60000) });
    
    const pct = calculateAttendance({
      sessionWindow: { start: sessionStart, end: sessionEnd },
      checkInAt: new Date("2026-09-24T09:00:00Z"),
      events: [...events, ...hbEvents],
      config
    });
    expect(pct).toBe(100.00);
  });
});
