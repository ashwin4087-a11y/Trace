export function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="rounded-md border border-dashed border-line p-6 text-sm">
      <p className="font-semibold">{title}</p>
      {detail ? <p className="mt-1 text-ink/70">{detail}</p> : null}
    </div>
  );
}
