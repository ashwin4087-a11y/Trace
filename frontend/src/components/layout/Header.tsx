export function Header({ title, detail }: { title: string; detail?: string }) {
  return (
    <header className="mb-5">
      <h1 className="text-2xl font-bold">{title}</h1>
      {detail ? <p className="mt-1 text-sm text-ink/70">{detail}</p> : null}
    </header>
  );
}
