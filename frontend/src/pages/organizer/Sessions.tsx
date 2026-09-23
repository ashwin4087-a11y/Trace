import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OrganizerLayout } from "../../components/layout/OrganizerLayout";
import { ErrorState } from "../../components/common/ErrorState";
import { Input } from "../../components/common/Input";
import { Loader } from "../../components/common/Loader";
import { TraceBadge } from "../../components/trace/TraceBadge";
import { TraceButton } from "../../components/trace/TraceButton";
import { useWorkshopList } from "../../hooks/useWorkshop";
import { createSession, issueQr, listSessions } from "../../services/session.service";

import { QRCodeSVG } from "qrcode.react";

export function OrganizerSessionsPage() {
  const workshops = useWorkshopList();
  const workshopId = workshops.data?.[0]?.id ?? "";
  const client = useQueryClient();

  const sessions = useQuery({
    queryKey: ["sessions", workshopId],
    queryFn: () => listSessions(workshopId),
    enabled: Boolean(workshopId),
  });

  const [title, setTitle] = useState("Interactive Lecture & Lab");
  const [start, setStart] = useState("");
  const [activeToken, setActiveToken] = useState<{token: string, sessionId: string} | null>(null);
  const [mode, setMode] = useState<"ONLINE" | "OFFLINE" | "HYBRID">("ONLINE");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [venue, setVenue] = useState("");

  const create = useMutation({
    mutationFn: () =>
      createSession({
        workshopId,
        title,
        sessionDate: new Date(start).toISOString(),
        startTime: new Date(start).toISOString(),
        endTime: new Date(new Date(start).getTime() + 60 * 60 * 1000).toISOString(),
        mode,
        meetingProvider: mode === "ONLINE" || mode === "HYBRID" ? "GOOGLE_MEET" : undefined,
        meetingUrl: mode === "ONLINE" || mode === "HYBRID" ? meetingUrl : undefined,
        venue: mode === "OFFLINE" || mode === "HYBRID" ? venue : undefined,
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["sessions", workshopId] }),
  });

  return (
    <OrganizerLayout title="Faculty Session Scheduling">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Scheduled Sessions List */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs flex flex-col gap-4">
            <div className="border-b border-[#DFC1B0]/60 pb-3 flex items-center justify-between">
              <div>
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">
                  Scheduled Milestones
                </span>
                <h3 className="font-serif text-xl font-semibold text-[#1A1412] mt-0.5">
                  {workshops.data?.[0]?.title || "Active Workshop Sessions"}
                </h3>
              </div>
              <TraceBadge variant="cream">{sessions.data?.length ?? 0} Sessions</TraceBadge>
            </div>

            {sessions.isLoading ? <Loader /> : null}

            {activeToken ? (
              <div className="p-6 bg-[#FFEDDB] border border-[#BF9270] rounded-lg text-xs font-sans text-[#1A1412] flex flex-col items-center justify-center gap-4">
                <span className="font-bold text-[#BF9270] uppercase tracking-wider text-sm">Session Master QR Code</span>
                <QRCodeSVG 
                  value={`${window.location.origin}/scan?token=${activeToken.token}&sessionId=${activeToken.sessionId}`} 
                  size={256} 
                  level="H" 
                  includeMargin 
                  fgColor="#1A1412" 
                  bgColor="#FFFFFF" 
                />
                <span className="font-mono text-base font-bold tracking-wider">{activeToken.token}</span>
                <span className="text-[#5F524B] text-center max-w-sm">
                  Display this code on screen during the live lecture for participants to scan and log attendance.
                </span>
              </div>
            ) : null}

            {sessions.data && sessions.data.length > 0 ? (
              <div className="space-y-3">
                {sessions.data.map((session, idx) => (
                  <div
                    key={session.id}
                    className="p-4 bg-[#FFEDDB]/40 border border-[#DFC1B0]/60 rounded-lg flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#BF9270] uppercase">Session {idx + 1}</span>
                      <h4 className="font-semibold text-sm text-[#1A1412] mt-0.5">{session.title}</h4>
                      <p className="text-[#5F524B] mt-0.5 flex gap-2">
                        <span>{session.startTime ? new Date(session.startTime).toLocaleString() : "TBD"}</span>
                        <span className="text-[#BF9270] font-semibold">{session.mode}</span>
                      </p>
                    </div>

                    <TraceButton
                      variant="secondary"
                      size="sm"
                      icon="qr_code_2"
                      onClick={async () => {
                        const { token } = await issueQr(session.id);
                        setActiveToken({ token, sessionId: session.id });
                      }}
                    >
                      Issue Token
                    </TraceButton>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-sans text-xs text-[#5F524B]">No sessions created yet for this workshop.</p>
            )}
          </div>
        </div>

        {/* Schedule New Session Form */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <form
            className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              create.mutate();
            }}
          >
            <div className="border-b border-[#DFC1B0]/60 pb-3">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">
                New Milestone
              </span>
              <h3 className="font-serif text-lg font-semibold text-[#1A1412] mt-0.5">
                Add Session to Workshop
              </h3>
            </div>

            <Input
              label="Session Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />

            <Input
              label="Start Date & Time"
              type="datetime-local"
              value={start}
              onChange={(event) => setStart(event.target.value)}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-bold uppercase tracking-wider text-[#1A1412]">
                Delivery Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full bg-[#FAFAFA] border border-[#DFC1B0] rounded-lg px-4 py-2.5 text-sm font-sans text-[#1A1412] focus:outline-none focus:border-[#BF9270] focus:ring-1 focus:ring-[#BF9270]"
              >
                <option value="ONLINE">Online (Google Meet)</option>
                <option value="OFFLINE">Offline (In-Person)</option>
                <option value="HYBRID">Hybrid (Both)</option>
              </select>
            </div>

            {(mode === "ONLINE" || mode === "HYBRID") && (
              <Input
                label="Google Meet URL"
                type="url"
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                value={meetingUrl}
                onChange={(event) => setMeetingUrl(event.target.value)}
                required
              />
            )}

            {(mode === "OFFLINE" || mode === "HYBRID") && (
              <Input
                label="Physical Venue"
                placeholder="Room 101, Main Building"
                value={venue}
                onChange={(event) => setVenue(event.target.value)}
                required
              />
            )}

            {create.isError ? <ErrorState message="Failed to create session." /> : null}

            <TraceButton type="submit" disabled={!workshopId || create.isPending} icon="add">
              {create.isPending ? "Adding Session..." : "Add Session"}
            </TraceButton>
          </form>
        </div>
      </div>
    </OrganizerLayout>
  );
}
