import { DEFAULT_CERTIFICATE_MIN_PERCENT } from "../constants";

export function calculateAttendancePercentage(attended: number, total: number): number {
  if (total <= 0) return 0;
  if (attended < 0) return 0;
  const safeAttended = Math.min(attended, total);
  return Math.round((safeAttended / total) * 10000) / 100;
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

export function calculateInactiveIntervals(
  events: MinimalEvent[],
  sessionStart: Date,
  sessionEnd: Date,
  gracePeriodSeconds: number = 10
): number {
  const sessionStartMs = sessionStart.getTime();
  const sessionEndMs = sessionEnd.getTime();
  
  if (sessionEndMs <= sessionStartMs) return 0; // Invalid session

  const sorted = [...events].sort((a, b) => a.serverTime.getTime() - b.serverTime.getTime());
  
  let tabHiddenStart: number | null = null;
  let focusLostStart: number | null = null;
  let fullscreenExitStart: number | null = null;
  
  const rawIntervals: { start: number; end: number }[] = [];
  
  for (const event of sorted) {
    const time = event.serverTime.getTime();
    if (event.type === "TAB_HIDDEN" && tabHiddenStart === null) tabHiddenStart = time;
    if (event.type === "FOCUS_LOST" && focusLostStart === null) focusLostStart = time;
    if (event.type === "FULLSCREEN_EXIT" && fullscreenExitStart === null) fullscreenExitStart = time;
    
    if (event.type === "TAB_VISIBLE" && tabHiddenStart !== null) {
      rawIntervals.push({ start: tabHiddenStart, end: time });
      tabHiddenStart = null;
    }
    if (event.type === "FOCUS_REGAINED" && focusLostStart !== null) {
      rawIntervals.push({ start: focusLostStart, end: time });
      focusLostStart = null;
    }
    if (event.type === "FULLSCREEN_ENTER" && fullscreenExitStart !== null) {
      rawIntervals.push({ start: fullscreenExitStart, end: time });
      fullscreenExitStart = null;
    }
  }
  
  if (tabHiddenStart !== null) rawIntervals.push({ start: tabHiddenStart, end: sessionEndMs });
  if (focusLostStart !== null) rawIntervals.push({ start: focusLostStart, end: sessionEndMs });
  if (fullscreenExitStart !== null) rawIntervals.push({ start: fullscreenExitStart, end: sessionEndMs });
  
  if (rawIntervals.length === 0) return 0;
  
  // Sort by start time for merging
  rawIntervals.sort((a, b) => a.start - b.start);
  
  const mergedIntervals: { start: number; end: number }[] = [rawIntervals[0]];
  
  for (let i = 1; i < rawIntervals.length; i++) {
    const last = mergedIntervals[mergedIntervals.length - 1];
    const current = rawIntervals[i];
    
    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end);
    } else {
      mergedIntervals.push(current);
    }
  }
  
  let totalInactiveMs = 0;
  const gracePeriodMs = gracePeriodSeconds * 1000;
  
  for (const interval of mergedIntervals) {
    const clampedStart = Math.max(interval.start, sessionStartMs);
    const clampedEnd = Math.min(interval.end, sessionEndMs);
    
    const duration = clampedEnd - clampedStart;
    if (duration > 0) {
      const deducted = Math.max(0, duration - gracePeriodMs);
      totalInactiveMs += deducted;
    }
  }
  
  return totalInactiveMs;
}
