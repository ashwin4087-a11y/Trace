import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { OrganizerLayout } from "../../components/layout/OrganizerLayout";
import { Input } from "../../components/common/Input";
import { Loader } from "../../components/common/Loader";
import { TraceBadge } from "../../components/trace/TraceBadge";
import { TraceButton } from "../../components/trace/TraceButton";
import { useWorkshopList } from "../../hooks/useWorkshop";
import { markAttendance, workshopAttendance } from "../../services/attendance.service";
import { listSessions } from "../../services/session.service";

export function OrganizerAttendancePage() {
  const workshops = useWorkshopList();
  const workshopId = workshops.data?.[0]?.id ?? "";

  const sessions = useQuery({
    queryKey: ["sessions", workshopId],
    queryFn: () => listSessions(workshopId),
    enabled: Boolean(workshopId),
  });

  const history = useQuery({
    queryKey: ["attendance", workshopId],
    queryFn: () => workshopAttendance(workshopId),
    enabled: Boolean(workshopId),
  });

  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const sessionId = sessions.data?.[0]?.id ?? "";

  return (
    <OrganizerLayout title="Faculty Attendance Management">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Manual Attendance Marking */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <form
            className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs flex flex-col gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setMessage("");
              await markAttendance({ sessionId, userId, status: "PRESENT" });
              setMessage("Participant attendance recorded successfully!");
              setUserId("");
              await history.refetch();
            }}
          >
            <div className="border-b border-[#DFC1B0]/60 pb-3">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">
                Manual Check-in
              </span>
              <h3 className="font-serif text-lg font-semibold text-[#1A1412] mt-0.5">
                Record Participant Attendance
              </h3>
            </div>

            <Input
              label="Participant User ID / Email ID"
              placeholder="Enter user ID..."
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              required
            />

            {message ? (
              <div className="p-3 bg-[#FFEDDB] border border-[#BF9270] rounded-lg text-xs font-semibold text-[#1A1412] text-center">
                ✓ {message}
              </div>
            ) : null}

            <TraceButton type="submit" disabled={!sessionId} icon="done">
              Mark Present
            </TraceButton>
          </form>
        </div>

        {/* Right Column: Attendance Records History Table */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs flex flex-col gap-4">
            <div className="border-b border-[#DFC1B0]/60 pb-3 flex items-center justify-between">
              <div>
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">
                  Session Audit
                </span>
                <h3 className="font-serif text-xl font-semibold text-[#1A1412] mt-0.5">
                  Logged Attendance Records
                </h3>
              </div>
              <TraceBadge variant="cream">{history.data?.length ?? 0} Records</TraceBadge>
            </div>

            {history.isLoading ? <Loader /> : null}

            {history.data && history.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#DFC1B0]/60 text-[#5F524B] uppercase tracking-wider font-bold">
                      <th className="py-2.5 px-3">Participant Email</th>
                      <th className="py-2.5 px-3">Session Title</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFC1B0]/40">
                    {history.data.map((item) => (
                      <tr key={item.id} className="hover:bg-[#FFEDDB]/30 transition-colors">
                        <td className="py-3 px-3 font-semibold text-[#1A1412]">
                          {item.user?.email || "Scholar"}
                        </td>
                        <td className="py-3 px-3 text-[#5F524B]">{item.session?.title || "Session"}</td>
                        <td className="py-3 px-3">
                          <TraceBadge variant={item.status === "PRESENT" ? "terracotta" : "cream"}>
                            {item.status}
                          </TraceBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="font-sans text-xs text-[#5F524B]">No attendance logs recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </OrganizerLayout>
  );
}
