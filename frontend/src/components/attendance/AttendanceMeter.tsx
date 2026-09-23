export function AttendanceMeter({ percentage }: { percentage: number }) {
  const eligible = percentage >= 90;
  return (
    <div>
      <div className="h-2 rounded bg-paper">
        <div className="h-2 rounded bg-brand" style={{ width: `${Math.min(percentage, 100)}%` }} />
      </div>
      <p className="mt-1 text-sm">{percentage}% attendance · {eligible ? "Eligible for a certificate" : "Below the 90% threshold"}</p>
    </div>
  );
}
