import { Link } from "react-router-dom";
import { Badge } from "../common/Badge";
import type { Workshop } from "../../types/workshop";

export function WorkshopCard({ workshop }: { workshop: Workshop }) {
  return (
    <Link to={`/workshops/${workshop.id}`} className="block rounded-lg border border-line bg-card p-4 hover:border-brand">
      <div className="mb-2 flex gap-2">
        <Badge>{workshop.domain.replaceAll("_", " ")}</Badge>
        <Badge tone="good">{workshop.language}</Badge>
      </div>
      <h3 className="font-bold">{workshop.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-ink/70">{workshop.description}</p>
      <p className="mt-3 text-xs">{workshop.priceCents === 0 ? "Free" : `${workshop.currency} ${(workshop.priceCents / 100).toFixed(2)}`}</p>
    </Link>
  );
}
