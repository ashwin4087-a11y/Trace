import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { OrganizerLayout } from "../../components/layout/OrganizerLayout";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useWorkshopList } from "../../hooks/useWorkshop";
import { markAttendance, workshopAttendance } from "../../services/attendance.service";
import { listSessions } from "../../services/session.service";

export function OrganizerAttendancePage() {
  const workshops = useWorkshopList();
  const workshopId = workshops.data?.[0]?.id ?? "";
  const sessions = useQuery({ queryKey: ["sessions", workshopId], queryFn: () => listSessions(workshopId), enabled: Boolean(workshopId) });
  const history = useQuery({ queryKey: ["attendance", workshopId], queryFn: () => workshopAttendance(workshopId), enabled: Boolean(workshopId) });
  const [userId, setUserId] = useState("");
  const sessionId = sessions.data?.[0]?.id ?? "";
  return (
    <OrganizerLayout title="Attendance">
      <form
        className="mb-4 grid max-w-md gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          await markAttendance({ sessionId, userId, status: "PRESENT" });
          await history.refetch();
        }}
      >
        <Input label="Participant user id" value={userId} onChange={(event) => setUserId(event.target.value)} required />
        <Button type="submit" disabled={!sessionId}>Mark present</Button>
      </form>
      <ul className="space-y-1 text-sm">
        {history.data?.map((item) => (
          <li key={item.id}>{item.user?.email} · {item.session?.title} · {item.status}</li>
        ))}
      </ul>
    </OrganizerLayout>
  );
}
