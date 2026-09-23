export function Badge({ children, tone = "neutral" }: { children: string; tone?: "neutral" | "good" | "warn" }) {
  const tones = {
    neutral: "bg-paper text-ink",
    good: "bg-emerald-100 text-emerald-900",
    warn: "bg-amber-100 text-amber-900",
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
