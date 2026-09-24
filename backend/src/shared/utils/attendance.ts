import { DEFAULT_CERTIFICATE_MIN_PERCENT } from "../constants";

export function calculateAttendancePercentage(attended: number, total: number): number {
  if (total <= 0) return 0;
  if (attended < 0) return 0;
  const safeAttended = Math.min(attended, total);
  return Math.round((safeAttended / total) * 10000) / 100;
}

export function getSessionDurationMs(session: { startTime?: Date | null; endTime?: Date | null }): number {
  if (!session.startTime || !session.endTime) {
    throw new Error("Session is missing start or end time");
  }
  const startMs = session.startTime.getTime();
  const endMs = session.endTime.getTime();
  if (endMs <= startMs) {
    throw new Error("Session end time must be after start time");
  }
  const duration = endMs - startMs;
  if (duration === 0) {
    throw new Error("Session duration cannot be zero");
  }
  return duration;
}

export function isCertificateEligible(
  percentage: number,
  minimum = DEFAULT_CERTIFICATE_MIN_PERCENT,
): boolean {
  return percentage >= minimum;
}

export interface MinimalEvent {
  type: string;
  serverTime: Date;
}

export interface AttendanceConfig {
  fullscreenGraceMs: number;
  focusGraceMs: number;
  heartbeatIntervalMs: number;
  heartbeatGapMultiplier: number;
}

export interface AttendanceInput {
  sessionWindow: { start: Date; end: Date };
  checkInAt: Date | null;
  events: MinimalEvent[];
  config: AttendanceConfig;
}

export function calculateAttendance(input: AttendanceInput): number {
  if (!input.checkInAt) return 0;

  const sessionStartMs = input.sessionWindow.start.getTime();
  const sessionEndMs = input.sessionWindow.end.getTime();
  const durationMs = sessionEndMs - sessionStartMs;
  if (durationMs <= 0) return 0;

  const checkInMs = Math.min(Math.max(input.checkInAt.getTime(), sessionStartMs), sessionEndMs);
  
  const sortedEvents = [...input.events].sort((a, b) => a.serverTime.getTime() - b.serverTime.getTime());
  
  const rawIntervals: { start: number; end: number; grace: number }[] = [];
  
  // 1. Initial missed time before check-in
  if (checkInMs > sessionStartMs) {
    rawIntervals.push({ start: sessionStartMs, end: checkInMs, grace: 0 });
  }

  // 2. Start/recovery pairing
  let tabHiddenStart: number | null = null;
  let focusLostStart: number | null = null;
  let fullscreenExitStart: number | null = null;
  
  for (const event of sortedEvents) {
    const time = event.serverTime.getTime();
    if (event.type === "TAB_HIDDEN" && tabHiddenStart === null) tabHiddenStart = time;
    if (event.type === "FOCUS_LOST" && focusLostStart === null) focusLostStart = time;
    if (event.type === "FULLSCREEN_EXIT" && fullscreenExitStart === null) fullscreenExitStart = time;
    
    if (event.type === "TAB_VISIBLE" && tabHiddenStart !== null) {
      rawIntervals.push({ start: tabHiddenStart, end: time, grace: input.config.focusGraceMs });
      tabHiddenStart = null;
    }
    if (event.type === "FOCUS_REGAINED" && focusLostStart !== null) {
      rawIntervals.push({ start: focusLostStart, end: time, grace: input.config.focusGraceMs });
      focusLostStart = null;
    }
    if (event.type === "FULLSCREEN_ENTER" && fullscreenExitStart !== null) {
      rawIntervals.push({ start: fullscreenExitStart, end: time, grace: input.config.fullscreenGraceMs });
      fullscreenExitStart = null;
    }
  }
  
  if (tabHiddenStart !== null) rawIntervals.push({ start: tabHiddenStart, end: sessionEndMs, grace: input.config.focusGraceMs });
  if (focusLostStart !== null) rawIntervals.push({ start: focusLostStart, end: sessionEndMs, grace: input.config.focusGraceMs });
  if (fullscreenExitStart !== null) rawIntervals.push({ start: fullscreenExitStart, end: sessionEndMs, grace: input.config.fullscreenGraceMs });

  // 3. Heartbeat gaps
  const maxGapMs = input.config.heartbeatIntervalMs * input.config.heartbeatGapMultiplier;
  const presenceEvents = sortedEvents.filter(e => 
    e.type === "HEARTBEAT" || e.type === "CHECK_IN" || e.type === "TAB_VISIBLE" || e.type === "FOCUS_REGAINED" || e.type === "FULLSCREEN_ENTER"
  );
  
  let lastPresenceMs = checkInMs;
  for (const event of presenceEvents) {
    const time = Math.min(Math.max(event.serverTime.getTime(), sessionStartMs), sessionEndMs);
    if (time > lastPresenceMs + maxGapMs) {
      rawIntervals.push({ start: lastPresenceMs + maxGapMs, end: time, grace: 0 });
    }
    lastPresenceMs = Math.max(lastPresenceMs, time);
  }
  if (sessionEndMs > lastPresenceMs + maxGapMs) {
    rawIntervals.push({ start: lastPresenceMs + maxGapMs, end: sessionEndMs, grace: 0 });
  }

  // Deduct grace period, drop intervals shorter than grace, and clip to session window
  const processedIntervals = rawIntervals.map(inv => {
    const start = Math.max(inv.start, sessionStartMs);
    const end = Math.min(inv.end, sessionEndMs);
    const dur = end - start;
    if (dur <= inv.grace) return null;
    return { start: start + inv.grace, end };
  }).filter(Boolean) as { start: number; end: number }[];

  if (processedIntervals.length === 0) {
    return 100;
  }

  // Merge overlaps (union)
  processedIntervals.sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number }[] = [processedIntervals[0]];
  
  for (let i = 1; i < processedIntervals.length; i++) {
    const last = merged[merged.length - 1];
    const current = processedIntervals[i];
    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push(current);
    }
  }

  let totalInactiveMs = 0;
  for (const inv of merged) {
    totalInactiveMs += (inv.end - inv.start);
  }

  const effectiveDurationMs = Math.max(0, durationMs - totalInactiveMs);
  return calculateAttendancePercentage(effectiveDurationMs, durationMs);
}

// Keep calculateInactiveIntervals for backward compatibility with tests if needed, or point it to the new logic
export function calculateInactiveIntervals(
  events: MinimalEvent[],
  sessionStart: Date,
  sessionEnd: Date,
  gracePeriodSeconds: number = 10
): number {
  const config = {
    fullscreenGraceMs: gracePeriodSeconds * 1000,
    focusGraceMs: gracePeriodSeconds * 1000,
    heartbeatIntervalMs: 1000000000, // effectively infinite
    heartbeatGapMultiplier: 1
  };
  
  const rawIntervals: { start: number; end: number; grace: number }[] = [];
  let tabHiddenStart: number | null = null;
  let focusLostStart: number | null = null;
  let fullscreenExitStart: number | null = null;
  
  const sessionStartMs = sessionStart.getTime();
  const sessionEndMs = sessionEnd.getTime();
  if (sessionEndMs <= sessionStartMs) return 0;
  
  const sorted = [...events].sort((a, b) => a.serverTime.getTime() - b.serverTime.getTime());
  for (const event of sorted) {
    const time = event.serverTime.getTime();
    if (event.type === "TAB_HIDDEN" && tabHiddenStart === null) tabHiddenStart = time;
    if (event.type === "FOCUS_LOST" && focusLostStart === null) focusLostStart = time;
    if (event.type === "FULLSCREEN_EXIT" && fullscreenExitStart === null) fullscreenExitStart = time;
    
    if (event.type === "TAB_VISIBLE" && tabHiddenStart !== null) {
      rawIntervals.push({ start: tabHiddenStart, end: time, grace: config.focusGraceMs });
      tabHiddenStart = null;
    }
    if (event.type === "FOCUS_REGAINED" && focusLostStart !== null) {
      rawIntervals.push({ start: focusLostStart, end: time, grace: config.focusGraceMs });
      focusLostStart = null;
    }
    if (event.type === "FULLSCREEN_ENTER" && fullscreenExitStart !== null) {
      rawIntervals.push({ start: fullscreenExitStart, end: time, grace: config.fullscreenGraceMs });
      fullscreenExitStart = null;
    }
  }
  
  if (tabHiddenStart !== null) rawIntervals.push({ start: tabHiddenStart, end: sessionEndMs, grace: config.focusGraceMs });
  if (focusLostStart !== null) rawIntervals.push({ start: focusLostStart, end: sessionEndMs, grace: config.focusGraceMs });
  if (fullscreenExitStart !== null) rawIntervals.push({ start: fullscreenExitStart, end: sessionEndMs, grace: config.fullscreenGraceMs });
  
  const processed = rawIntervals.map(inv => {
    const start = Math.max(inv.start, sessionStartMs);
    const end = Math.min(inv.end, sessionEndMs);
    const dur = end - start;
    if (dur <= inv.grace) return null;
    return { start: start + inv.grace, end };
  }).filter(Boolean) as { start: number; end: number }[];
  
  if (processed.length === 0) return 0;
  processed.sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number }[] = [processed[0]];
  for (let i = 1; i < processed.length; i++) {
    const last = merged[merged.length - 1];
    const current = processed[i];
    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push(current);
    }
  }
  
  let inactiveMs = 0;
  for (const inv of merged) inactiveMs += (inv.end - inv.start);
  return inactiveMs;
}
