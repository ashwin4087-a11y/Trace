export function Loader({ label = "Loading" }: { label?: string }) {
  return <p className="text-sm text-ink/70">{label}…</p>;
}
