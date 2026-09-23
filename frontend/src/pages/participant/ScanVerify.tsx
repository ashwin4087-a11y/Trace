import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { verifyMyQr } from "../../services/attendance.service";
import { Loader } from "../../components/common/Loader";
import { TraceButton } from "../../components/trace/TraceButton";
import { ErrorState } from "../../components/common/ErrorState";
import { getSessionAccess } from "../../services/session.service";

export function ScanVerifyPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const sessionId = searchParams.get("sessionId");
  const navigate = useNavigate();

  const [meetingUrl, setMeetingUrl] = useState<string | null>(null);

  const verifyMutation = useMutation({
    mutationFn: () => verifyMyQr(sessionId!, token!),
    onSuccess: async () => {
      try {
        const access = await getSessionAccess(sessionId!);
        if (access.meetingUrl) {
          setMeetingUrl(access.meetingUrl);
        }
      } catch (err) {
        console.error("Failed to get session access", err);
      }
    }
  });

  useEffect(() => {
    if (token && sessionId && !verifyMutation.isPending && !verifyMutation.isSuccess && !verifyMutation.isError) {
      verifyMutation.mutate();
    }
  }, [token, sessionId]);

  if (!token || !sessionId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4 text-center">
        <h2 className="text-xl font-bold text-[#1A1412]">Invalid Link</h2>
        <p className="text-[#5F524B]">This QR code link is missing required parameters.</p>
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
          <ErrorState message={(verifyMutation.error as Error).message || "Failed to verify attendance. Please try again or contact your organizer."} />
          <TraceButton variant="secondary" onClick={() => verifyMutation.mutate()}>
            Try Again
          </TraceButton>
        </div>
      )}

      {verifyMutation.isSuccess && (
        <div className="flex flex-col items-center gap-4 w-full">
          <p className="text-[#5F524B]">Your attendance has been successfully logged.</p>
          
          {meetingUrl ? (
            <div className="mt-4 p-4 bg-[#FAFAFA] border border-[#DFC1B0] rounded-xl w-full flex flex-col gap-3">
              <span className="font-bold text-[#BF9270] uppercase text-sm tracking-wider">Session Link Unlocked</span>
              <TraceButton 
                onClick={() => window.open(meetingUrl, "_blank")}
                icon="videocam"
              >
                Join Google Meet
              </TraceButton>
            </div>
          ) : (
            <p className="text-[#5F524B] text-sm mt-4 italic">No online meeting link found for this session.</p>
          )}

          <TraceButton variant="ghost" onClick={() => navigate("/participant")} className="mt-2">
            Return to Dashboard
          </TraceButton>
        </div>
      )}
    </div>
  );
}
