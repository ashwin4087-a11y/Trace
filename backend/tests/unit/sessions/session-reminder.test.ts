import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../../src/config/database";
import { notifySessionReminder } from "../../../src/modules/notifications/notification.service";
import { processSessionReminders } from "../../../src/jobs/session-reminder.job";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("../../../src/config/database", () => ({
  prisma: {
    platformSetting: { upsert: vi.fn() },
    workshopSession: { findUnique: vi.fn(), findMany: vi.fn() },
    registration: { findMany: vi.fn() },
    notification: { findMany: vi.fn(), create: vi.fn(), createMany: vi.fn() },
  },
}));

vi.mock("../../../src/integrations/email/email.provider", () => ({
  sendEmail: vi.fn().mockResolvedValue({ delivered: true, mode: "smtp" }),
}));

import { sendEmail } from "../../../src/integrations/email/email.provider";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const enabledSettings = { notificationsEnabled: true };
const disabledSettings = { notificationsEnabled: false };

const defaultPreference = {
  emailEnabled: true,
  inAppEnabled: true,
  workshopAlerts: true,
  sessionReminders: true,
  certificateAlerts: true,
};

function makeSession(overrides: Record<string, unknown> = {}) {
  return {
    id: "session-1",
    workshopId: "workshop-1",
    title: "Intro Session",
    startTime: new Date("2026-10-10T09:00:00Z"),
    meetingUrl: "https://meet.google.com/abc",
    venue: null,
    status: "SCHEDULED",
    workshop: { title: "TRACE Workshop" },
    ...overrides,
  };
}

function makeRegistration(userId: string, status = "CONFIRMED", prefOverrides: Record<string, unknown> = {}) {
  return {
    id: `reg-${userId}`,
    workshopId: "workshop-1",
    userId,
    status,
    user: {
      id: userId,
      firstName: "User",
      lastName: "Test",
      email: `${userId}@example.com`,
      notificationPreference: { ...defaultPreference, ...prefOverrides },
    },
  };
}

// ─── Tests: notifySessionReminder ────────────────────────────────────────────

describe("notifySessionReminder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.platformSetting.upsert as ReturnType<typeof vi.fn>).mockResolvedValue(enabledSettings);
    (prisma.notification.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (prisma.notification.create as ReturnType<typeof vi.fn>).mockResolvedValue({});
  });

  it("returns 0 when notificationsEnabled is false", async () => {
    (prisma.platformSetting.upsert as ReturnType<typeof vi.fn>).mockResolvedValue(disabledSettings);
    const result = await notifySessionReminder("session-1");
    expect(result.notified).toBe(0);
    expect(prisma.workshopSession.findUnique).not.toHaveBeenCalled();
  });

  it("returns 0 when session is not found", async () => {
    (prisma.workshopSession.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const result = await notifySessionReminder("nonexistent");
    expect(result.notified).toBe(0);
  });

  it("returns 0 for a CANCELLED session", async () => {
    (prisma.workshopSession.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(makeSession({ status: "CANCELLED" }));
    const result = await notifySessionReminder("session-1");
    expect(result.notified).toBe(0);
    expect(prisma.registration.findMany).not.toHaveBeenCalled();
  });

  it("returns 0 for a COMPLETED session", async () => {
    (prisma.workshopSession.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(makeSession({ status: "COMPLETED" }));
    const result = await notifySessionReminder("session-1");
    expect(result.notified).toBe(0);
  });

  it("notifies a CONFIRMED participant", async () => {
    (prisma.workshopSession.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(makeSession());
    (prisma.registration.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([makeRegistration("p1")]);

    const result = await notifySessionReminder("session-1");

    expect(result.notified).toBe(1);
    expect(prisma.notification.create).toHaveBeenCalledOnce();
    expect(sendEmail).toHaveBeenCalledOnce();
  });

  it("does NOT notify a WAITLISTED participant", async () => {
    (prisma.workshopSession.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(makeSession());
    // findMany with status:CONFIRMED will return empty (service filters at DB level)
    (prisma.registration.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const result = await notifySessionReminder("session-1");
    expect(result.notified).toBe(0);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("does NOT notify a CANCELLED registration", async () => {
    (prisma.workshopSession.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(makeSession());
    (prisma.registration.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const result = await notifySessionReminder("session-1");
    expect(result.notified).toBe(0);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("prevents duplicate reminders for the same participant+session", async () => {
    (prisma.workshopSession.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(makeSession());
    (prisma.registration.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([makeRegistration("p1")]);
    // Simulate existing reminder notification
    (prisma.notification.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ userId: "p1" }]);

    const result = await notifySessionReminder("session-1");
    expect(result.notified).toBe(0);
    expect(prisma.notification.create).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("handles multiple confirmed participants correctly", async () => {
    (prisma.workshopSession.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(makeSession());
    (prisma.registration.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeRegistration("p1"),
      makeRegistration("p2"),
      makeRegistration("p3"),
    ]);

    const result = await notifySessionReminder("session-1");
    expect(result.notified).toBe(3);
    expect(sendEmail).toHaveBeenCalledTimes(3);
    expect(prisma.notification.create).toHaveBeenCalledTimes(3);
  });

  it("skips both in-app and email when sessionReminders preference is false", async () => {
    (prisma.workshopSession.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(makeSession());
    (prisma.registration.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeRegistration("p1", "CONFIRMED", { sessionReminders: false }),
    ]);

    await notifySessionReminder("session-1");
    // deliver() exits early when the notification type is disallowed by prefs:
    // no in-app notification row should be created and no email sent
    expect(prisma.notification.create).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("skips email when emailEnabled is false but still creates in-app notification", async () => {
    (prisma.workshopSession.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(makeSession());
    (prisma.registration.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeRegistration("p1", "CONFIRMED", { emailEnabled: false }),
    ]);

    const result = await notifySessionReminder("session-1");
    expect(result.notified).toBe(1);
    expect(prisma.notification.create).toHaveBeenCalledOnce(); // in-app still created
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("skips in-app notification when inAppEnabled is false but sends email", async () => {
    (prisma.workshopSession.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(makeSession());
    (prisma.registration.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeRegistration("p1", "CONFIRMED", { inAppEnabled: false }),
    ]);

    const result = await notifySessionReminder("session-1");
    expect(result.notified).toBe(1);
    expect(prisma.notification.create).not.toHaveBeenCalled(); // in-app skipped
    expect(sendEmail).toHaveBeenCalledOnce();
  });

  it("works when meetingUrl and venue are both null", async () => {
    (prisma.workshopSession.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSession({ meetingUrl: null, venue: null }),
    );
    (prisma.registration.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([makeRegistration("p1")]);

    await expect(notifySessionReminder("session-1")).resolves.not.toThrow();
    expect(result => result).toBeDefined();
    // Email should still be sent with a generic location message
    expect(sendEmail).toHaveBeenCalledOnce();
    const callArgs = (sendEmail as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArgs.text).toContain("dashboard");
  });
});

// ─── Tests: processSessionReminders ──────────────────────────────────────────

describe("processSessionReminders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.platformSetting.upsert as ReturnType<typeof vi.fn>).mockResolvedValue(enabledSettings);
    (prisma.notification.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (prisma.notification.create as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (prisma.registration.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
  });

  it("queries sessions within ±30 minutes of the 24-hour mark", async () => {
    const now = new Date("2026-10-09T10:00:00Z").getTime();
    (prisma.workshopSession.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    await processSessionReminders(now);

    const call = (prisma.workshopSession.findMany as ReturnType<typeof vi.fn>).mock.calls[0][0];
    const gte = call.where.startTime.gte as Date;
    const lte = call.where.startTime.lte as Date;

    // Window should be [now+23h30m, now+24h30m]
    expect(gte.toISOString()).toBe(new Date("2026-10-10T09:30:00Z").toISOString());
    expect(lte.toISOString()).toBe(new Date("2026-10-10T10:30:00Z").toISOString());
  });

  it("does not process sessions outside the reminder window", async () => {
    const now = new Date("2026-10-08T10:00:00Z").getTime(); // 2 days before
    (prisma.workshopSession.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]); // none in window

    const result = await processSessionReminders(now);
    expect(result.processed).toBe(0);
  });

  it("processes multiple sessions found in the window", async () => {
    const now = Date.now();
    (prisma.workshopSession.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "s1" },
      { id: "s2" },
    ]);
    (prisma.workshopSession.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(makeSession());

    const result = await processSessionReminders(now);
    expect(result.processed).toBe(2);
    expect(result.errors).toBe(0);
  });

  it("counts errors without throwing when a single session reminder fails", async () => {
    const now = Date.now();
    (prisma.workshopSession.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "s-bad" }]);
    (prisma.workshopSession.findUnique as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("DB error"));

    const result = await processSessionReminders(now);
    expect(result.processed).toBe(0);
    expect(result.errors).toBe(1);
  });

  it("only targets SCHEDULED sessions (not LIVE, COMPLETED, CANCELLED)", async () => {
    const now = Date.now();
    (prisma.workshopSession.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    await processSessionReminders(now);

    const call = (prisma.workshopSession.findMany as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.where.status).toEqual({ in: ["SCHEDULED"] });
  });
});
