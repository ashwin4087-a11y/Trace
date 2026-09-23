import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ParticipantLayout } from "../../components/layout/ParticipantLayout";
import { MaterialList } from "../../components/learning/MaterialList";
import { Loader } from "../../components/common/Loader";
import { listMaterials } from "../../services/learning.service";
import { listSessions } from "../../services/session.service";

export function WorkshopLearningPage() {
  const { id = "" } = useParams();
  const materials = useQuery({ queryKey: ["materials", id], queryFn: () => listMaterials(id), enabled: Boolean(id) });
  const sessions = useQuery({ queryKey: ["sessions", id], queryFn: () => listSessions(id), enabled: Boolean(id) });
  return (
    <ParticipantLayout title="Workshop learning">
      {materials.isLoading ? <Loader /> : null}
      <h2 className="mb-2 font-semibold">Sessions</h2>
      <ul className="mb-4 text-sm">
        {sessions.data?.map((session) => (
          <li key={session.id}>{session.title} · {session.meetingUrl ? <a className="text-brand" href={session.meetingUrl}>Join</a> : "Venue pending"}</li>
        ))}
      </ul>
      <h2 className="mb-2 font-semibold">Materials</h2>
      <MaterialList items={materials.data ?? []} />
    </ParticipantLayout>
  );
}
