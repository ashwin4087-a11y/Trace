import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ParticipantLayout } from "../../components/layout/ParticipantLayout";
import { Loader } from "../../components/common/Loader";
import { api, unwrap } from "../../services/api";
import type { Workshop } from "../../types/workshop";

type Recommendation = { score: number; reasons: string[]; workshop: Workshop };

export function RecommendationsPage() {
  const query = useQuery({
    queryKey: ["recommendations"],
    queryFn: () => unwrap<Recommendation[]>(api.get("/recommendations/me")),
  });
  return (
    <ParticipantLayout title="Recommendations">
      <p className="mb-3 text-sm">Rule-based matches use domain, department, year, skills, interests, and language. This is not a machine-learning model.</p>
      {query.isLoading ? <Loader /> : null}
      <ul className="space-y-3">
        {query.data?.map((item) => (
          <li key={item.workshop.id} className="rounded border border-line p-3">
            <Link className="font-semibold" to={`/workshops/${item.workshop.id}`}>{item.workshop.title}</Link>
            <p className="text-sm">Score {item.score}. {item.reasons.join(". ")}</p>
          </li>
        ))}
      </ul>
    </ParticipantLayout>
  );
}
