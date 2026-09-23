import { ParticipantLayout } from "../../components/layout/ParticipantLayout";
import { AttendanceMeter } from "../../components/attendance/AttendanceMeter";
import { Loader } from "../../components/common/Loader";
import { TraceBadge } from "../../components/trace/TraceBadge";
import { useAttendance } from "../../hooks/useAttendance";
import { useRegistration } from "../../hooks/useRegistration";

export function AttendancePage() {
  const registrations = useRegistration();
  const workshopId = registrations.data?.[0]?.workshopId;
  const { history, percent } = useAttendance(workshopId);

  return (
    <ParticipantLayout title="Attendance Telemetry">
      <div className="flex flex-col gap-8">
        <p className="font-sans text-xs text-[#5F524B]">
          Server-validated attendance tracking. A minimum of 90% attendance across mandatory workshop sessions is required to unlock your verifiable certificate.
        </p>

        {history.isLoading || percent.isLoading ? <Loader /> : null}

        {percent.data ? (
          <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs max-w-xl">
            <h3 className="font-serif text-lg font-semibold text-[#1A1412] mb-4">Cumulative Attendance Meter</h3>
            <AttendanceMeter percentage={percent.data.percentage} />
          </div>
        ) : (
          <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 text-center text-xs text-[#5F524B]">
            Register for a workshop to view real-time attendance telemetry.
          </div>
        )}

        <section className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs flex flex-col gap-4">
          <div className="border-b border-[#DFC1B0]/60 pb-3 flex items-center justify-between">
            <h3 className="font-serif text-xl font-semibold text-[#1A1412]">Attendance History Log</h3>
            <TraceBadge variant="cream">{history.data?.length ?? 0} Check-ins</TraceBadge>
          </div>

          {history.data && history.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#DFC1B0]/60 text-[#5F524B] uppercase tracking-wider font-bold">
                    <th className="py-2.5 px-3">Workshop</th>
                    <th className="py-2.5 px-3">Session</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFC1B0]/40">
                  {history.data.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FFEDDB]/30 transition-colors">
                      <td className="py-3 px-3 font-semibold text-[#1A1412]">
                        {item.session?.workshop?.title || "Academic Workshop"}
                      </td>
                      <td className="py-3 px-3 text-[#5F524B]">{item.session?.title || "Session"}</td>
                      <td className="py-3 px-3">
                        <TraceBadge variant={item.status === "PRESENT" ? "terracotta" : "cream"}>
                          {item.status}
                        </TraceBadge>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[#5F524B]">
                        {item.method || "QR Code"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="font-sans text-xs text-[#5F524B]">No check-in records recorded yet.</p>
          )}
        </section>
      </div>
    </ParticipantLayout>
  );
}
