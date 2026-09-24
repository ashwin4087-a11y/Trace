import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ParticipantLayout } from "../../components/layout/ParticipantLayout";
import { MaterialList } from "../../components/learning/MaterialList";
import { Loader } from "../../components/common/Loader";
import { TraceBadge } from "../../components/trace/TraceBadge";
import { TraceButton } from "../../components/trace/TraceButton";
import { listMaterials } from "../../services/learning.service";
import { listSessions, getSessionAccess } from "../../services/session.service";
import { QRCodeSVG } from "qrcode.react";
import { generateMyQr, getSessionStatus, verifyMyQr, heartbeat, recordEvent } from "../../services/attendance.service";
import { useRegistration } from "../../hooks/useRegistration";
import { WorkshopSelector } from "../../components/common/WorkshopSelector";

function SessionRow({ session }: { session: any }) {
  const [accessState, setAccessState] = useState<{ access: string; meetingUrl?: string | null; monitoringSession?: any } | null>(null);
  const [qrState, setQrState] = useState<{ qrPayload: string; expiresIn: number; sessionId: string; passcode: string; scanUrl?: string } | null>(null);
  const [verifyToken, setVerifyToken] = useState("");
  
  const fetchAccess = async () => {
    try {
      const data = await getSessionAccess(session.id);
      setAccessState(data);
    } catch (e) {
      setAccessState({ access: "LOCKED" });
    }
  };

  const checkStatus = async () => {
    try {
      const status = await getSessionStatus(session.id);
      if (status.status === "PRESENT") {
        fetchAccess();
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (session.status !== "SCHEDULED") {
      fetchAccess();
    }
  }, [session.status]);

  // Polling for Check-in Status (while not yet checked in)
  useEffect(() => {
    if (session.status === "LIVE" && (!accessState || accessState.access !== "GRANTED")) {
      const interval = setInterval(checkStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [session.status, accessState]);

  // Polling for Meeting Going Live (while checked in but waiting for organizer)
  useEffect(() => {
    if (session.status === "LIVE" && accessState?.access === "GRANTED" && !accessState?.meetingUrl) {
      const interval = setInterval(fetchAccess, 5000);
      return () => clearInterval(interval);
    }
  }, [session.status, accessState?.access, accessState?.meetingUrl]);

  // Heartbeat & Fullscreen Monitoring
  useEffect(() => {
    if (accessState?.access === "GRANTED" && accessState?.monitoringSession?.status === "ACTIVE") {
      const interval = setInterval(() => {
        heartbeat(accessState.monitoringSession.id).catch(() => fetchAccess()); // Re-fetch on failure to detect termination
      }, 30000); // 30s heartbeat
      
      const handleVisibilityChange = () => {
        recordEvent(accessState.monitoringSession.id, document.hidden ? "TAB_HIDDEN" : "TAB_VISIBLE").catch(() => {});
      };

      const handleFocus = () => recordEvent(accessState.monitoringSession.id, "FOCUS_REGAINED").catch(() => {});
      const handleBlur = () => recordEvent(accessState.monitoringSession.id, "FOCUS_LOST").catch(() => {});
      const handleFullscreenChange = () => {
        const isFullscreen = !!document.fullscreenElement;
        recordEvent(accessState.monitoringSession.id, isFullscreen ? "FULLSCREEN_ENTER" : "FULLSCREEN_EXIT").catch(() => {});
      };
      
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("focus", handleFocus);
      window.addEventListener("blur", handleBlur);
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      
      return () => {
        clearInterval(interval);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("focus", handleFocus);
        window.removeEventListener("blur", handleBlur);
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
      };
    }
  }, [accessState]);

  const generateQrMutation = useMutation({
    mutationFn: () => generateMyQr(session.id),
    onSuccess: (data) => setQrState(data)
  });

  // Rotate QR automatically when expires
  useEffect(() => {
    if (qrState) {
      const ms = Math.max(1000, qrState.expiresIn * 1000);
      const timeout = setTimeout(() => generateQrMutation.mutate(), ms);
      return () => clearTimeout(timeout);
    }
  }, [qrState]);

  const verifyQrMutation = useMutation({
    mutationFn: () => verifyMyQr(session.id, verifyToken),
    onSuccess: () => fetchAccess(),
    onError: () => alert("Invalid or Expired Passcode!")
  });

  const getScanUrl = () => {
    if (!qrState) return "";
    return qrState.scanUrl || `${window.location.origin}/scan?sessionId=${session.id}&token=${qrState.qrPayload}`;
  };

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

          {session.status === "LIVE" && !accessState?.meetingUrl && !qrState && accessState?.access !== "GRANTED" && (
            <TraceButton size="sm" onClick={() => generateQrMutation.mutate()} disabled={generateQrMutation.isPending}>
              Get Attendance QR
            </TraceButton>
          )}

          {/* Checked in but meeting not yet live */}
          {accessState?.access === "GRANTED" && !accessState?.meetingUrl && session.status === "LIVE" && (
            <div className="flex items-center gap-2 text-xs text-[#5F524B]">
              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
              <span>Checked In — Waiting for organizer to start meeting</span>
            </div>
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
      
      {qrState && (!accessState || accessState.access !== "GRANTED") && (
        <div className="mt-2 p-3 bg-white border border-[#DFC1B0] rounded flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-shrink-0 bg-white p-2 border border-[#DFC1B0] rounded shadow-sm">
            <QRCodeSVG value={getScanUrl()} size={150} level="M" />
          </div>
          <div className="flex flex-col gap-2 flex-grow text-center md:text-left">
            <p className="font-bold text-lg text-[#1A1412]">Scan to Check In</p>
            <p className="text-[#5F524B] text-sm">Use your smartphone camera to scan this QR code. The meeting link will unlock automatically upon successful check-in.</p>
            <div className="mt-2 text-sm text-[#BF9270] flex flex-col gap-1">
              <span className="font-semibold uppercase tracking-wider text-xs">Fallback Passcode</span>
              <span className="font-mono text-xl text-[#1A1412] font-bold tracking-widest">{qrState.passcode}</span>
            </div>
            
            <div className="flex flex-col gap-2 items-center md:items-start mt-2 border-t border-[#DFC1B0]/30 pt-3">
              <p className="text-[10px] text-[#5F524B]">Manual Entry (if phone scanning fails):</p>
              <div className="flex gap-2 w-full max-w-xs">
                <input 
                  type="text" 
                  placeholder="Enter 6-char passcode..." 
                  maxLength={6}
                  value={verifyToken} 
                  onChange={(e) => setVerifyToken(e.target.value.toUpperCase())}
                  className="border border-[#DFC1B0] rounded px-3 py-1.5 text-sm outline-none flex-grow uppercase"
                />
                <TraceButton size="sm" variant="secondary" onClick={() => verifyQrMutation.mutate()} disabled={verifyToken.length !== 6 || verifyQrMutation.isPending}>
                  Verify
                </TraceButton>
              </div>
            </div>
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
  const navigate = useNavigate();
  const registrations = useRegistration();
  const availableWorkshops = registrations.data?.map(reg => reg.workshop!).filter(Boolean) ?? [];

  const materials = useQuery({ queryKey: ["materials", id], queryFn: () => listMaterials(id), enabled: !!id });
  const sessions = useQuery({ queryKey: ["sessions", id], queryFn: () => listSessions(id), enabled: !!id });

  return (
    <ParticipantLayout title="Interactive Learning Workspace">
      <div className="mb-6">
        <WorkshopSelector 
          workshops={availableWorkshops as any} 
          selectedId={id} 
          onSelect={(newId) => navigate(`/participant/workshops/${newId}/learn`)} 
          isLoading={registrations.isLoading} 
        />
      </div>
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
