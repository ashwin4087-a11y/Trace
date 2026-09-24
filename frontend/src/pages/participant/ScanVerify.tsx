import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { verifyMyQr } from "../../services/attendance.service";
import { Loader } from "../../components/common/Loader";
import { TraceButton } from "../../components/trace/TraceButton";
import { ErrorState } from "../../components/common/ErrorState";
import { getSessionAccess } from "../../services/session.service";
import { useAuth } from "../../context/AuthContext";

export function ScanVerifyPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const sessionId = searchParams.get("sessionId");
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [checkInAt, setCheckInAt] = useState<Date | null>(null);

  // If not logged in, redirect to login, then come back here to complete check-in
  useEffect(() => {
    if (!loading && !user) {
      const scanPath = `/scan?${searchParams.toString()}`;
      navigate(`/login?redirect=${encodeURIComponent(scanPath)}`, { replace: true });
    }
  }, [user, loading]);

  const verifyMutation = useMutation({
    mutationFn: () => verifyMyQr(sessionId!, token!),
    onSuccess: async (data) => {
      // Record check-in time from verify response
      if (data?.attendance?.verifiedAt) {
        setCheckInAt(new Date(data.attendance.verifiedAt));
      } else {
        setCheckInAt(new Date());
      }
      try {
        const access = await getSessionAccess(sessionId!);
        if (data?.meetingAccess?.meetingUrl) {
          setTimeout(() => {
            window.location.assign(data.meetingAccess.meetingUrl);
          }, 2200);
        } else if (access.workshopId) {
          // Auto-navigate to workshop learning page after showing confirmation
          setTimeout(() => {
            navigate(`/participant/workshops/${access.workshopId}/learn`, { replace: true });
          }, 2200);
        }
      } catch (err) {
        console.error("Failed to get session access", err);
      }
    }
  });

  useEffect(() => {
    if (user && token && sessionId && !verifyMutation.isPending && !verifyMutation.isSuccess && !verifyMutation.isError) {
      verifyMutation.mutate();
    }
  }, [user, token, sessionId]);

  if (!token || !sessionId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4 text-center">
        <h2 className="text-xl font-bold text-[#1A1412]">Invalid Link</h2>
        <p className="text-[#5F524B]">This QR code link is missing required parameters.</p>
      </div>
    );
  }

  // Show loader while auth state resolves or while redirecting to login
  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader />
        <p className="text-[#5F524B] text-sm">Preparing authentication…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-6 text-center max-w-md mx-auto">
      <div className="p-4 rounded-full bg-[#FFEDDB] text-[#BF9270]">
        <span className="material-symbols-rounded text-4xl">
          {verifyMutation.isSuccess ? "check_circle" : verifyMutation.isError ? "error" : "qr_code_scanner"}
        </span>
      </div>

      <h1 className="text-2xl font-serif font-bold text-[#1A1412]">
        {verifyMutation.isSuccess ? "Attendance Recorded" : verifyMutation.isError ? "Verification Failed" : "Verifying QR Code..."}
      </h1>

      {verifyMutation.isPending && (
        <div className="flex flex-col items-center gap-4">
          <Loader />
          <p className="text-[#5F524B]">Please wait while we log your attendance for this session.</p>
        </div>
      )}

      {verifyMutation.isError && (
        <div className="flex flex-col items-center gap-4 w-full">
          <ErrorState message={(verifyMutation.error as any)?.response?.data?.error?.message || (verifyMutation.error as Error).message || "Failed to verify attendance. Please try again or contact your organizer."} />
          <TraceButton variant="secondary" onClick={() => verifyMutation.mutate()}>
            Try Again
          </TraceButton>
          <TraceButton variant="ghost" onClick={() => navigate("/participant")}>
            Return to Dashboard
          </TraceButton>
        </div>
      )}

      {verifyMutation.isSuccess && (
        <div className="w-full max-w-sm border border-[#BF9270]/40 rounded-2xl bg-[#FFFFFF] shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-[#1A1412] px-6 py-4 flex items-center gap-3">
            <span className="material-symbols-rounded text-green-400 text-2xl">check_circle</span>
            <div className="text-left">
              <p className="text-[#FFEDDB] font-serif text-lg font-normal">Attendance Recorded</p>
              <p className="text-[#BF9270] text-xs font-sans">You have been marked present</p>
            </div>
          </div>
          {/* Details */}
          <div className="px-6 py-5 flex flex-col gap-3">
            <div className="flex justify-between text-xs font-sans border-b border-[#DFC1B0]/40 pb-3">
              <span className="text-[#5F524B] uppercase tracking-wider font-semibold">Check-in</span>
              <span className="text-[#1A1412] font-semibold">
                {checkInAt ? checkInAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
              </span>
            </div>
            <div className="flex justify-between text-xs font-sans">
              <span className="text-[#5F524B] uppercase tracking-wider font-semibold">Status</span>
              <span className="flex items-center gap-1.5 text-green-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                PRESENT
              </span>
            </div>
            {verifyMutation.data?.meetingAccess?.meetingUrl ? (
              <p className="pt-2 text-xs text-[#5F524B]">
                Meeting link unlocked. Redirecting you to the live session...
              </p>
            ) : (
              <p className="pt-2 text-xs text-[#5F524B]">
                Attendance verified. The meeting link will appear when the host starts the meeting.
              </p>
            )}
          </div>
          {/* Footer */}
          <div className="px-6 pb-5">
            <p className="text-[10px] text-[#5F524B] text-center">
              Redirecting to your workshop…
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

