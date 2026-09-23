import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { OrganizerLayout } from "../../components/layout/OrganizerLayout";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useWorkshopList } from "../../hooks/useWorkshop";
import { createSession, issueQr, listSessions } from "../../services/session.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function OrganizerSessionsPage() {
  const workshops = useWorkshopList();
  const workshopId = workshops.data?.[0]?.id ?? "";
  const client = useQueryClient();
  const sessions = useQuery({ queryKey: ["sessions", workshopId], queryFn: () => listSessions(workshopId), enabled: Boolean(workshopId) });
  const [title, setTitle] = useState("Session");
  const [start, setStart] = useState("");
  const [token, setToken] = useState("");
  const create = useMutation({
    mutationFn: () => createSession({
      workshopId,
      title,
      sessionDate: new Date(start).toISOString(),
      startTime: new Date(start).toISOString(),
      endTime: new Date(new Date(start).getTime() + 60 * 60 * 1000).toISOString(),
    }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["sessions", workshopId] }),
  });
  return (
    <OrganizerLayout title="Sessions">
      <ul className="mb-4 space-y-2 text-sm">
        {sessions.data?.map((session) => (
          <li key={session.id} className="flex items-center justify-between gap-3">
            <span>{session.title}</span>
            <Button variant="secondary" onClick={async () => setToken((await issueQr(session.id)).token)}>QR code</Button>
          </li>
        ))}
      </ul>
      {token ? <p className="mb-3 text-sm">Show this code once: {token}</p> : null}
      <form className="grid max-w-md gap-3" onSubmit={(event) => { event.preventDefault(); create.mutate(); }}>
        <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
        <Input label="Start" type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} required />
        <Button type="submit" disabled={!workshopId}>Add session</Button>
      </form>
    </OrganizerLayout>
  );
}
