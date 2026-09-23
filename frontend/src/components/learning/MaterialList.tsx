import type { LearningMaterial } from "../../types/learning";

export function MaterialList({ items }: { items: LearningMaterial[] }) {
  if (!items.length) return <p className="text-sm">No materials yet.</p>;
  return (
    <ul className="space-y-2 text-sm">
      {items.map((item) => (
        <li key={item.id}><a className="text-brand underline" href={item.url}>{item.title}</a> · {item.type}</li>
      ))}
    </ul>
  );
}
