import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ParticipantLayout } from "../../components/layout/ParticipantLayout";
import { ErrorState } from "../../components/common/ErrorState";
import { Input } from "../../components/common/Input";
import { Loader } from "../../components/common/Loader";
import { TraceBadge } from "../../components/trace/TraceBadge";
import { TraceButton } from "../../components/trace/TraceButton";
import { useRegistration } from "../../hooks/useRegistration";
import { errorText } from "../../lib/errors";
import { checkIn } from "../../services/attendance.service";
import { listSessions } from "../../services/session.service";

export function SessionsPage() {
  const registrations = useRegistration();
  const confirmedReg = registrations.data?.find((item) => item.status === "CONFIRMED") || registrations.data?.[0];

  const sessions = useQuery({
    queryKey: ["sessions", confirmedReg?.workshopId],
    queryFn: () => listSessions(confirmedReg!.workshopId),
    enabled: Boolean(confirmedReg?.workshopId),
  });

  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  return (
    <ParticipantLayout title="Sessions & Attendance Check-In">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Scheduled Sessions */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs flex flex-col gap-4">
            <div className="border-b border-[#DFC1B0]/60 pb-3 flex items-center justify-between">
              <div>
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">
                  Academic Schedule
                </span>
                <h3 className="font-serif text-xl text-[#1A1412] font-semibold mt-0.5">
                  {confirmedReg?.workshop?.title || "Enrolled Sessions"}
                </h3>
              </div>
              <TraceBadge variant="cream">{sessions.data?.length ?? 0} Sessions</TraceBadge>
            </div>

            {sessions.isLoading ? <Loader /> : null}

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
                      <p className="text-[#5F524B] mt-0.5">
                        {session.startTime ? new Date(session.startTime).toLocaleString() : "TBD"}
                      </p>
                    </div>
                    {session.meetingUrl ? (
                      <a href={session.meetingUrl} target="_blank" rel="noopener noreferrer">
                        <TraceButton size="sm" icon="video_camera_front">
                          Join
                        </TraceButton>
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-sans text-xs text-[#5F524B]">No scheduled sessions found for your active workshop.</p>
            )}
          </div>
        </div>

        {/* Right Column: QR Check-In Form */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <form
            className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs flex flex-col gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setError("");
              setMessage("");
              try {
                await checkIn(token);
                setMessage("Attendance recorded successfully!");
                setToken("");
              } catch (caught) {
                setError(errorText(caught));
              }
            }}
          >
            <div className="border-b border-[#DFC1B0]/60 pb-3">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">
                Live Attendance Check-In
              </span>
              <h3 className="font-serif text-lg text-[#1A1412] font-semibold mt-0.5">
                Scan QR or Enter Token
              </h3>
            </div>

            <p className="font-sans text-xs text-[#5F524B] leading-relaxed">
              Open the companion session page and complete verification there. Attendance is recorded only after that verification succeeds.
            </p>

            <Input
              label="Session Code / Token"
              placeholder="e.g. ATT-2026-99"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              required
            />

            {error ? <ErrorState message={error} /> : null}
            {message ? (
              <div className="p-3 bg-[#FFEDDB] border border-[#BF9270] rounded-lg text-xs text-[#1A1412] font-semibold text-center">
                ✓ {message}
              </div>
            ) : null}

            <TraceButton type="submit" className="w-full justify-center" icon="qr_code_scanner">
              Verify Check-In
            </TraceButton>
          </form>
        </div>
      </div>
    </ParticipantLayout>
  );
}
