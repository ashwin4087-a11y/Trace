import { describe, expect, it } from "vitest";
import {
  finalizedDurationSeconds,
  finalizedPercentage,
  firstJoinAt,
} from "../../../backend/src/modules/attendance/attendance-timing";

describe("Jitsi attendance timing", () => {
  const joinedAt = new Date("2026-09-24T10:05:14.000Z");
  const endedAt = new Date("2026-09-24T11:00:02.000Z");

  it("does not count QR check-in before the first meeting join", () => {
    expect(finalizedDurationSeconds(null, endedAt, 3600)).toBeNull();
  });

  it("records the first server join timestamp", () => {
    expect(firstJoinAt(null, joinedAt)).toBe(joinedAt);
  });

  it("keeps the original join timestamp on rejoin", () => {
    expect(firstJoinAt(joinedAt, new Date("2026-09-24T10:20:00.000Z"))).toBe(joinedAt);
  });

  it("does not change duration when a participant leaves and rejoins", () => {
    const duration = finalizedDurationSeconds(joinedAt, endedAt, 3600);
    expect(duration).toBe(3288);
    expect(finalizedDurationSeconds(joinedAt, endedAt, 3600)).toBe(duration);
  });

  it("uses meeting end minus first join and caps at the scheduled duration", () => {
    expect(finalizedDurationSeconds(joinedAt, endedAt, 3600)).toBe(3288);
    expect(finalizedPercentage(3288, 3600)).toBe(91.33);
    expect(finalizedDurationSeconds(joinedAt, new Date("2026-09-24T12:00:00.000Z"), 3600)).toBe(6886);
  });

  it("does not invent duration for a checked-in participant who never joins", () => {
    expect(finalizedDurationSeconds(undefined, endedAt, 3600)).toBeNull();
    expect(finalizedPercentage(null, 3600)).toBe(0);
  });
});
