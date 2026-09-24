export function firstJoinAt(existingJoinedAt: Date | null | undefined, serverNow: Date): Date {
  return existingJoinedAt ?? serverNow;
}

export function finalizedDurationSeconds(
  joinedAt: Date | null | undefined,
  meetingEndedAt: Date,
  scheduledSeconds: number,
): number | null {
  if (!joinedAt) return null;
  const elapsed = Math.max(0, Math.round((meetingEndedAt.getTime() - joinedAt.getTime()) / 1000));
  return Math.max(0, elapsed);
}

export function finalizedPercentage(durationSeconds: number | null, scheduledSeconds: number): number {
  if (durationSeconds == null || scheduledSeconds <= 0) return 0;
  return Math.min(100, Math.round((durationSeconds / scheduledSeconds) * 10000) / 100);
}
