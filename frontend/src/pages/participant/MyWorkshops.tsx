import { Link } from "react-router-dom";
import { ParticipantLayout } from "../../components/layout/ParticipantLayout";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { Loader } from "../../components/common/Loader";
import { useRegistration } from "../../hooks/useRegistration";
import { errorText } from "../../lib/errors";

export function MyWorkshopsPage() {
  const query = useRegistration();
  return (
    <ParticipantLayout title="My workshops">
      {query.isLoading ? <Loader /> : null}
      {query.isError ? <ErrorState message={errorText(query.error)} /> : null}
      {query.data?.length === 0 ? <EmptyState title="You have not registered yet" /> : null}
      <ul className="space-y-3">
        {query.data?.map((item) => (
          <li key={item.id} className="rounded border border-line bg-card p-4">
            <Link className="font-semibold" to={`/participant/workshops/${item.workshopId}/learn`}>{item.workshop?.title}</Link>
            <p className="text-sm">Status: {item.status}</p>
          </li>
        ))}
      </ul>
    </ParticipantLayout>
  );
}
