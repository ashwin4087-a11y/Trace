import { beforeEach, describe, expect, it, vi } from "vitest";
import crypto from "node:crypto";
import { prisma } from "../../../backend/src/config/database";
import { env } from "../../../backend/src/config/environment";
import { issueToken, redeemToken, reissueToken, revokeToken, validateWindow } from "../../../backend/src/modules/attendance-verification/attendance-token.service";

vi.mock("../../../backend/src/config/database", () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback(prisma)),
    registration: { findUnique: vi.fn() },
    workshopSession: { findUnique: vi.fn() },
    attendanceAccessToken: {
      updateMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const now = new Date("2026-09-24T10:00:00.000Z");
const workshop = { joinWindowMinutesBefore: 30, endGraceMinutes: 15 };
const session = {
  id: "session-1",
  workshopId: "workshop-1",
  startTime: new Date("2026-09-24T10:00:00.000Z"),
  endTime: new Date("2026-09-24T11:00:00.000Z"),
  status: "SCHEDULED",
  workshop,
};
const registration = {
  id: "registration-1",
  workshopId: "workshop-1",
  status: "CONFIRMED",
  workshop,
};

beforeEach(() => {
  vi.clearAllMocks();
  env.attendance.enabled = true;
  vi.useFakeTimers();
  vi.setSystemTime(now);
  vi.mocked(prisma.registration.findUnique).mockResolvedValue(registration as any);
  vi.mocked(prisma.workshopSession.findUnique).mockResolvedValue(session as any);
  vi.mocked(prisma.attendanceAccessToken.updateMany).mockResolvedValue({ count: 1 } as any);
  vi.mocked(prisma.attendanceAccessToken.create).mockImplementation(async ({ data }: any) => ({ id: "token-1", ...data } as any));
});

describe("attendance access tokens", () => {
  it("creates high-entropy base64url tokens and stores only their hash", async () => {
    const first = await issueToken("registration-1", "session-1");
    const second = await issueToken("registration-1", "session-1");

    expect(first.token).not.toBe(second.token);
    expect(first.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(first.token).not.toContain(first.accessToken.tokenHash);
    expect(first.accessToken.tokenHash).toBe(crypto.createHash("sha256").update(first.token).digest("hex"));
    expect(prisma.attendanceAccessToken.updateMany).toHaveBeenCalledTimes(2);
  });

  it("calculates the configurable join and grace window", () => {
    const result = validateWindow(now, session, workshop);
    expect(result.validFrom.toISOString()).toBe("2026-09-24T09:30:00.000Z");
    expect(result.expiresAt.toISOString()).toBe("2026-09-24T11:15:00.000Z");
    expect(result.isOpen).toBe(true);
  });

  it("rejects token redemption when attendance is disabled", async () => {
    env.attendance.enabled = false;
    await expect(redeemToken("token")).rejects.toThrow("Attendance verification is disabled");
  });

  it("rejects non-confirmed registrations and wrong sessions uniformly", async () => {
    const issued = await issueToken("registration-1", "session-1");
    vi.mocked(prisma.attendanceAccessToken.findUnique).mockResolvedValue({
      id: "token-1",
      tokenHash: crypto.createHash("sha256").update(issued.token).digest("hex"),
      registration,
      workshopSession: session,
    } as any);
    await expect(redeemToken(issued.token, "other-session")).rejects.toThrow("Attendance token is invalid or unavailable");

    vi.mocked(prisma.attendanceAccessToken.findUnique).mockResolvedValue({
      id: "token-1",
      tokenHash: crypto.createHash("sha256").update(issued.token).digest("hex"),
      registration: { ...registration, status: "WAITLISTED" },
      workshopSession: session,
    } as any);
    await expect(redeemToken(issued.token)).rejects.toThrow("Attendance token is invalid or unavailable");
  });

  it("redeems a valid token once and marks it consumed", async () => {
    const issued = await issueToken("registration-1", "session-1");
    const hash = crypto.createHash("sha256").update(issued.token).digest("hex");
    vi.mocked(prisma.attendanceAccessToken.findUnique).mockResolvedValue({
      id: "token-1",
      tokenHash: hash,
      workshopSessionId: "session-1",
      registration,
      workshopSession: session,
    } as any);
    vi.mocked(prisma.attendanceAccessToken.update).mockResolvedValue({ id: "token-1", redeemedAt: now } as any);

    const result = await redeemToken(issued.token, "session-1");
    expect(result.registration.id).toBe("registration-1");
    expect(prisma.attendanceAccessToken.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "token-1" },
      data: { redeemedAt: now },
    }));
  });

  it("rejects tokens outside the valid window and revoked or replayed tokens", async () => {
    const issued = await issueToken("registration-1", "session-1");
    const hash = crypto.createHash("sha256").update(issued.token).digest("hex");
    const token = { id: "token-1", tokenHash: hash, registration, workshopSession: session };
    vi.mocked(prisma.attendanceAccessToken.findUnique).mockResolvedValue({ ...token, revokedAt: now } as any);
    await expect(redeemToken(issued.token)).rejects.toThrow("Attendance token is invalid or unavailable");

    vi.mocked(prisma.attendanceAccessToken.findUnique).mockResolvedValue({ ...token, redeemedAt: now } as any);
    await expect(redeemToken(issued.token)).rejects.toThrow("Attendance token is invalid or unavailable");

    vi.setSystemTime(new Date("2026-09-24T12:00:00.000Z"));
    vi.mocked(prisma.attendanceAccessToken.findUnique).mockResolvedValue(token as any);
    await expect(redeemToken(issued.token)).rejects.toThrow("Attendance token is invalid or unavailable");
  });

  it("revokes an existing token and reissue revokes previous live tokens", async () => {
    vi.mocked(prisma.attendanceAccessToken.update).mockResolvedValue({ id: "token-1", revokedAt: now } as any);
    await revokeToken("token-1");
    expect(prisma.attendanceAccessToken.update).toHaveBeenCalledWith({
      where: { id: "token-1" },
      data: { revokedAt: now },
    });

    await reissueToken("registration-1", "session-1");
    expect(prisma.attendanceAccessToken.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { registrationId: "registration-1", workshopSessionId: "session-1", revokedAt: null },
    }));
  });
});
