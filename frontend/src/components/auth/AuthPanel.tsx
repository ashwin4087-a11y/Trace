export function AuthPanel({ title, children }: { title: string; children: string }) {
  return (
    <section className="rounded-lg border border-line bg-card p-4">
      <h2 className="font-bold">{title}</h2>
      <p className="text-sm text-ink/70">{children}</p>
    </section>
  );
}
