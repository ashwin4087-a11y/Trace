export function StatGrid({ stats }: { stats: { label: string; value: string | number }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border border-line bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-ink/60">{stat.label}</p>
          <p className="mt-1 text-2xl font-bold">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
