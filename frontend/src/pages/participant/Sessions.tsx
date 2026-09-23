import { useState } from "react";
import { ParticipantLayout } from "../../components/layout/ParticipantLayout";
import { Button } from "../../components/common/Button";
import { ErrorState } from "../../components/common/ErrorState";
import { Input } from "../../components/common/Input";
import { useRegistration } from "../../hooks/useRegistration";
import { errorText } from "../../lib/errors";
import { checkIn } from "../../services/attendance.service";
import { listSessions } from "../../services/session.service";
import { useQuery } from "@tanstack/react-query";

export function SessionsPage() {
  const registrations = useRegistration();
  const first = registrations.data?.find((item) => item.status === "CONFIRMED");
  const sessions = useQuery({
    queryKey: ["sessions", first?.workshopId],
    queryFn: () => listSessions(first!.workshopId),
    enabled: Boolean(first?.workshopId),
  });
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  return (
    <ParticipantLayout title="Sessions">
      <ul className="mb-4 space-y-2 text-sm">
        {sessions.data?.map((session) => <li key={session.id}>{session.title} · {new Date(session.startTime).toLocaleString()}</li>)}
      </ul>
      <form
        className="grid max-w-md gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          try {
            await checkIn(token);
            setMessage("Attendance recorded.");
          } catch (caught) {
            setError(errorText(caught));
          }
        }}
      >
        <Input label="QR attendance code" value={token} onChange={(event) => setToken(event.target.value)} />
        {error ? <ErrorState message={error} /> : null}
        {message ? <p className="text-sm">{message}</p> : null}
        <Button type="submit">Check in</Button>
      </form>
    </ParticipantLayout>
  );
}
