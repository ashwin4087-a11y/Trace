import { ParticipantLayout } from "../../components/layout/ParticipantLayout";
import { AttendanceMeter } from "../../components/attendance/AttendanceMeter";
import { Loader } from "../../components/common/Loader";
import { useAttendance } from "../../hooks/useAttendance";
import { useRegistration } from "../../hooks/useRegistration";

export function AttendancePage() {
  const registrations = useRegistration();
  const workshopId = registrations.data?.[0]?.workshopId;
  const { history, percent } = useAttendance(workshopId);
  return (
    <ParticipantLayout title="Attendance">
      {history.isLoading || percent.isLoading ? <Loader /> : null}
      {percent.data ? <AttendanceMeter percentage={percent.data.percentage} /> : <p className="text-sm">Register for a workshop to see attendance.</p>}
      <ul className="mt-4 space-y-2 text-sm">
        {history.data?.map((item) => (
          <li key={item.id}>{item.session?.workshop?.title} · {item.session?.title} · {item.status} · {item.method}</li>
        ))}
      </ul>
    </ParticipantLayout>
  );
}
