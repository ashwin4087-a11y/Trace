import { prisma } from "../config/database";
import { notifySessionReminder } from "../modules/notifications/notification.service";

/**
 * The half-width of the reminder window around the 24-hour mark.
 * Sessions whose startTime falls in [now+24h-WINDOW, now+24h+WINDOW] will be
 * targeted.  Default: ±30 minutes so we can run the job every hour without
 * missing or double-hitting sessions.
 */
const WINDOW_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Find sessions that start approximately `hoursAhead` hours from `now` and
 * are still in SCHEDULED or LIVE status, then send reminders for each.
 *
 * @param now      Injectable reference time — defaults to Date.now(). Pass a
 *                 fixed value in tests to make time-window logic deterministic.
 * @param hoursAhead Number of hours ahead to look. Defaults to 24.
 */
export async function processSessionReminders(
  now: number = Date.now(),
  hoursAhead = 24,
): Promise<{ processed: number; errors: number }> {
  const centerMs = now + hoursAhead * 60 * 60 * 1000;
  const windowStart = new Date(centerMs - WINDOW_MS);
  const windowEnd = new Date(centerMs + WINDOW_MS);

  const sessions = await prisma.workshopSession.findMany({
    where: {
      startTime: { gte: windowStart, lte: windowEnd },
      status: { in: ["SCHEDULED"] },
    },
    select: { id: true },
  });

  let processed = 0;
  let errors = 0;

  for (const session of sessions) {
    try {
      await notifySessionReminder(session.id);
      processed += 1;
    } catch (err) {
      errors += 1;
      console.error(`[session-reminder] Failed for session ${session.id}:`, err);
    }
  }

  console.info(
    `[session-reminder] Window: ${windowStart.toISOString()} – ${windowEnd.toISOString()} | sessions=${sessions.length} processed=${processed} errors=${errors}`,
  );

  return { processed, errors };
}

/**
 * Schedule the reminder processor to run every hour using a plain setInterval.
 * When Redis/BullMQ is available the job can additionally be queued there,
 * but the interval-based scheduler works without Redis and is always started.
 */
export function startSessionReminderScheduler(): NodeJS.Timeout {
  // Run once shortly after startup so reminders aren't delayed an extra hour
  setTimeout(() => {
    processSessionReminders().catch((err) => {
      console.error("[session-reminder] Initial run failed:", err instanceof Error ? err.message : err);
    });
  }, 5_000);

  const interval = setInterval(
    () => {
      processSessionReminders().catch((err) => {
        console.error("[session-reminder] Interval run failed:", err instanceof Error ? err.message : err);
      });
    },
    60 * 60 * 1000, // every 1 hour
  );

  // Allow the process to exit even if this interval is still active
  if (interval.unref) interval.unref();

  console.info("[session-reminder] Hourly scheduler started.");
  return interval;
}
