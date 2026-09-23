import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ParticipantLayout } from "../../components/layout/ParticipantLayout";
import { MaterialList } from "../../components/learning/MaterialList";
import { Loader } from "../../components/common/Loader";
import { TraceBadge } from "../../components/trace/TraceBadge";
import { TraceButton } from "../../components/trace/TraceButton";
import { listMaterials } from "../../services/learning.service";
import { listSessions, getSessionAccess } from "../../services/session.service";
import { generateMyQr, verifyMyQr, heartbeat, fullscreenViolation } from "../../services/attendance.service";

function SessionRow({ session }: { session: any }) {
  const [accessState, setAccessState] = useState<{ access: string; meetingUrl?: string; monitoringSession?: any } | null>(null);
  const [qrState, setQrState] = useState<{ qrPayload: string; expiresIn: number; sessionId: string } | null>(null);
  const [verifyToken, setVerifyToken] = useState("");
  
  const fetchAccess = async () => {
    try {
      const data = await getSessionAccess(session.id);
      setAccessState(data);
    } catch (e) {
      setAccessState({ access: "LOCKED" });
    }
  };

  useEffect(() => {
    if (session.status !== "SCHEDULED") {
      fetchAccess();
    }
  }, [session.status]);

  // Heartbeat & Fullscreen Monitoring
  useEffect(() => {
    if (accessState?.access === "GRANTED" && accessState?.monitoringSession?.status === "ACTIVE") {
      const interval = setInterval(() => {
        heartbeat(accessState.monitoringSession.id).catch(() => fetchAccess()); // Re-fetch on failure to detect termination
      }, 30000); // 30s heartbeat
      
      const handleVisibilityChange = () => {
        if (document.hidden) {
          fullscreenViolation(accessState.monitoringSession.id).catch(() => fetchAccess());
        }
      };
      
      document.addEventListener("visibilitychange", handleVisibilityChange);
      
      return () => {
        clearInterval(interval);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }
  }, [accessState]);

  const generateQrMutation = useMutation({
    mutationFn: () => generateMyQr(session.id),
    onSuccess: (data) => setQrState(data)
  });

  const verifyQrMutation = useMutation({
    mutationFn: () => verifyMyQr(session.id, verifyToken),
    onSuccess: () => fetchAccess(),
    onError: () => alert("Invalid or Expired Token!")
  });

  return (
    <div className="p-4 bg-[#FFEDDB]/40 border border-[#DFC1B0]/60 rounded-lg flex flex-col gap-3 text-xs">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <span className="font-bold text-[#BF9270] uppercase">Session</span>
          <h4 className="font-semibold text-sm text-[#1A1412] mt-0.5">{session.title}</h4>
          {session.startTime && (
            <p className="text-[#5F524B] mt-0.5 flex gap-2">
              <span>{new Date(session.startTime).toLocaleString()}</span>
              <span className="text-[#BF9270] font-semibold">{session.mode}</span>
            </p>
          )}
        </div>

        <div>
          {session.status === "SCHEDULED" && (
            <span className="text-[#5F524B] italic">Meeting Locked (Waiting for Organizer)</span>
          )}
          
          {session.status === "COMPLETED" && (
            <TraceBadge variant="cream">Completed</TraceBadge>
          )}

          {session.status === "LIVE" && !accessState?.meetingUrl && !qrState && (
            <TraceButton size="sm" onClick={() => generateQrMutation.mutate()} disabled={generateQrMutation.isPending}>
              Get Attendance QR
            </TraceButton>
          )}
          
          {accessState?.access === "GRANTED" && accessState?.meetingUrl && (
            <a href={accessState.meetingUrl} target="_blank" rel="noopener noreferrer">
              <TraceButton size="sm" icon="video_camera_front">
                Join Virtual Session
              </TraceButton>
            </a>
          )}
        </div>
      </div>
      
      {qrState && !accessState?.meetingUrl && (
        <div className="mt-2 p-3 bg-white border border-[#DFC1B0] rounded flex flex-col gap-2">
          <p className="font-bold text-[#BF9270]">Your Personal QR Token:</p>
          <p className="font-mono text-lg">{qrState.qrPayload}</p>
          <p className="text-[#5F524B] text-[10px]">Enter this token below to verify and unlock meeting access.</p>
          
          <div className="flex gap-2 items-center mt-2">
            <input 
              type="text" 
              placeholder="Enter token..." 
              value={verifyToken} 
              onChange={(e) => setVerifyToken(e.target.value)}
              className="border border-[#DFC1B0] rounded px-2 py-1 text-sm outline-none"
            />
            <TraceButton size="sm" variant="secondary" onClick={() => verifyQrMutation.mutate()} disabled={!verifyToken || verifyQrMutation.isPending}>
              Verify & Unlock
            </TraceButton>
          </div>
        </div>
      )}
      
      {accessState?.access === "GRANTED" && accessState?.monitoringSession && (
        <div className="mt-2 text-[10px] text-green-700 font-semibold flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Attendance Monitoring Active (Heartbeat & Fullscreen tracked)
        </div>
      )}
      
      {accessState?.access === "DENIED" && (
        <div className="mt-2 text-[10px] text-red-600 font-semibold">
          Access Denied. You may have been terminated for violations.
        </div>
      )}
    </div>
  );
}

export function WorkshopLearningPage() {
  const { id = "" } = useParams();
  const materials = useQuery({ queryKey: ["materials", id], queryFn: () => listMaterials(id), enabled: Boolean(id) });
  const sessions = useQuery({ queryKey: ["sessions", id], queryFn: () => listSessions(id), enabled: Boolean(id) });

  return (
    <ParticipantLayout title="Interactive Learning Workspace">
      <div className="flex flex-col gap-8">
        <p className="font-sans text-xs text-[#5F524B]">
          Access session details, live meeting links, learning materials, and course resources.
        </p>

        {materials.isLoading || sessions.isLoading ? <Loader /> : null}

        {/* Sessions Section */}
        <section className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs flex flex-col gap-4">
          <div className="border-b border-[#DFC1B0]/60 pb-3 flex items-center justify-between">
            <h2 className="font-serif text-xl text-[#1A1412] font-semibold">Scheduled Sessions</h2>
            <TraceBadge variant="cream">{sessions.data?.length ?? 0} Sessions</TraceBadge>
          </div>

          {sessions.data && sessions.data.length > 0 ? (
            <div className="space-y-3">
              {sessions.data.map((session) => (
                <SessionRow key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <p className="font-sans text-xs text-[#5F524B]">No active sessions scheduled yet for this workshop.</p>
          )}
        </section>

        {/* Materials Section */}
        <section className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs flex flex-col gap-4">
          <div className="border-b border-[#DFC1B0]/60 pb-3 flex items-center justify-between">
            <h2 className="font-serif text-xl text-[#1A1412] font-semibold">Learning Materials & Handouts</h2>
            <TraceBadge variant="cream">{materials.data?.length ?? 0} Resources</TraceBadge>
          </div>
          <MaterialList items={materials.data ?? []} />
        </section>
      </div>
    </ParticipantLayout>
  );
}
