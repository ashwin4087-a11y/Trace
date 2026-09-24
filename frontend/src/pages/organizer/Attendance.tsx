import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrganizerLayout } from "../../components/layout/OrganizerLayout";
import { Input } from "../../components/common/Input";
import { Loader } from "../../components/common/Loader";
import { TraceBadge } from "../../components/trace/TraceBadge";
import { TraceButton } from "../../components/trace/TraceButton";
import { useWorkshopList } from "../../hooks/useWorkshop";
import { markAttendance, sessionAttendance } from "../../services/attendance.service";
import { listSessions, updateSession } from "../../services/session.service";
import { useWorkshopContext } from "../../hooks/useWorkshopContext";
import { WorkshopSelector } from "../../components/common/WorkshopSelector";

export function OrganizerAttendancePage() {
  const workshops = useWorkshopList({ mine: 1 });
  const { workshopId, setWorkshopId } = useWorkshopContext(workshops.data);
  const client = useQueryClient();

  const sessions = useQuery({
    queryKey: ["sessions", workshopId],
    queryFn: () => listSessions(workshopId),
    enabled: !!workshopId,
  });

  const [selectedSessionId, setSelectedSessionId] = useState("");
  const validSessionIds = new Set(sessions.data?.map(s => s.id));
  const sessionId = (validSessionIds.has(selectedSessionId) ? selectedSessionId : sessions.data?.[0]?.id) ?? "";
  
  const liveAttendance = useQuery({
    queryKey: ["attendance", "live", sessionId],
    queryFn: () => sessionAttendance(sessionId),
    enabled: !!sessionId,
    refetchInterval: 30000 // refresh every 30s for live duration
  });

  const selectedSession = sessions.data?.find((s) => s.id === sessionId);

  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");

  const toggleSessionStatus = useMutation({
    mutationFn: (newStatus: "LIVE" | "COMPLETED") => updateSession(sessionId, { status: newStatus }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["sessions", workshopId] });
      client.invalidateQueries({ queryKey: ["attendance", "live", sessionId] });
    }
  });

  return (
    <OrganizerLayout title="Faculty Attendance Management">
      <div className="mb-6">
        <WorkshopSelector 
          workshops={workshops.data} 
          selectedId={workshopId} 
          onSelect={setWorkshopId} 
          isLoading={workshops.isLoading} 
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Manual Attendance Marking */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs flex flex-col gap-4">
            <div className="border-b border-[#DFC1B0]/60 pb-3">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">
                Active Session
              </span>
              <h3 className="font-serif text-lg font-semibold text-[#1A1412] mt-0.5">
                Session Control
              </h3>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-bold uppercase tracking-wider text-[#1A1412]">
                Select Session
              </label>
              <select
                value={sessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#DFC1B0] rounded-lg px-4 py-2.5 text-sm font-sans text-[#1A1412] focus:outline-none focus:border-[#BF9270] focus:ring-1 focus:ring-[#BF9270]"
              >
                {sessions.data?.map((s) => (
                  <option key={s.id} value={s.id}>{s.title} ({s.status})</option>
                ))}
              </select>
            </div>

            {selectedSession?.status === "SCHEDULED" && (
              <TraceButton onClick={() => toggleSessionStatus.mutate("LIVE")} disabled={toggleSessionStatus.isPending}>
                Start Attendance (Go LIVE)
              </TraceButton>
            )}

            {selectedSession?.status === "LIVE" && (
              <TraceButton variant="secondary" onClick={() => toggleSessionStatus.mutate("COMPLETED")} disabled={toggleSessionStatus.isPending}>
                End Session (Close Attendance)
              </TraceButton>
            )}
            
            {selectedSession?.status === "COMPLETED" && (
              <div className="p-3 bg-[#FFEDDB] border border-[#BF9270] rounded-lg text-xs font-semibold text-[#1A1412] text-center">
                Session is COMPLETED.
              </div>
            )}
          </div>

          <form
            className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs flex flex-col gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setMessage("");
              await markAttendance({ sessionId, userId, status: "PRESENT" });
              setMessage("Participant attendance recorded successfully!");
              setUserId("");
              await liveAttendance.refetch();
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
                  Live Monitoring
                </span>
                <h3 className="font-serif text-xl font-semibold text-[#1A1412] mt-0.5">
                  ATTENDANCE — {selectedSession?.status}
                </h3>
              </div>
              <div className="flex gap-4 text-sm font-semibold">
                <span className="text-green-700">{liveAttendance.data?.filter(r => r.status === "PRESENT").length || 0} Present</span>
                <span className="text-[#BF9270]">{liveAttendance.data?.filter(r => r.status === "EXCUSED").length || 0} Excused</span>
                <span className="text-red-700">{liveAttendance.data?.filter(r => r.status === "ABSENT").length || 0} Absent</span>
              </div>
            </div>

            {liveAttendance.isLoading ? <Loader /> : null}

            {liveAttendance.data && liveAttendance.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#DFC1B0]/60 text-[#5F524B] uppercase tracking-wider font-bold">
                      <th className="py-2.5 px-3">Participant</th>
                      <th className="py-2.5 px-3">Check-in</th>
                      <th className="py-2.5 px-3">Joined Meeting</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFC1B0]/40">
                    {liveAttendance.data.map((item) => (
                      <tr key={item.id} className="hover:bg-[#FFEDDB]/30 transition-colors">
                        <td className="py-3 px-3 font-semibold text-[#1A1412]">
                          {item.user?.firstName} {item.user?.lastName} <br />
                          <span className="text-[#5F524B] font-normal">{item.user?.email}</span>
                        </td>
                        <td className="py-3 px-3 text-[#5F524B]">
                          {item.checkInAt ? new Date(item.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                        </td>
                        <td className="py-3 px-3 text-[#5F524B]">
                          {item.joinedAt ? new Date(item.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                        </td>
                        <td className="py-3 px-3 font-semibold text-[#1A1412]">
                          {item.durationMinutes > 0 ? `${Math.floor(item.durationMinutes / 60)}h ${item.durationMinutes % 60}m` : item.joinedAt ? "0m" : "—"}
                        </td>
                        <td className="py-3 px-3 font-bold text-xs uppercase tracking-wider">
                          {!item.joinedAt && item.status === "PRESENT" ? (
                            <span className="text-[#5F524B]">NOT JOINED</span>
                          ) : item.monitoringStatus === "ACTIVE" ? (
                            <span className="flex items-center gap-1.5 text-green-700">
                              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                              ACTIVE
                            </span>
                          ) : item.finalizedAt ? (
                            <span className="flex items-center gap-1.5 text-[#5F524B]">
                              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                              FINALIZED
                            </span>
                          ) : (
                            <TraceBadge variant={item.status === "PRESENT" ? "terracotta" : "cream"}>
                              {item.status}
                            </TraceBadge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="font-sans text-xs text-[#5F524B]">No attendance data available for this session.</p>
            )}
          </div>
        </div>
      </div>
    </OrganizerLayout>
  );
}
