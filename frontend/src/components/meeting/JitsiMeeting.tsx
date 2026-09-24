import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, options: Record<string, unknown>) => {
      addListener: (event: string, handler: (payload?: unknown) => void) => void;
      dispose: () => void;
    };
  }
}

type JitsiMeetingProps = {
  roomName: string;
  displayName?: string;
  onFirstJoin: () => void;
};

const JITSI_DOMAIN = "meet.jit.si";
const JITSI_SCRIPT = "https://meet.jit.si/external_api.js";

function loadJitsiApi() {
  if (window.JitsiMeetExternalAPI) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${JITSI_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Unable to load Jitsi")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = JITSI_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Jitsi"));
    document.body.appendChild(script);
  });
}

export function JitsiMeeting({ roomName, displayName, onFirstJoin }: JitsiMeetingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const joinedRef = useRef(false);
  const onFirstJoinRef = useRef(onFirstJoin);
  const [browserUnsupported, setBrowserUnsupported] = useState(false);

  useEffect(() => {
    onFirstJoinRef.current = onFirstJoin;
  }, [onFirstJoin]);

  useEffect(() => {
    let api: { addListener: (event: string, handler: (payload?: unknown) => void) => void; dispose: () => void } | null = null;
    let disposed = false;
    joinedRef.current = false;

    if (!window.RTCPeerConnection || !navigator.mediaDevices?.getUserMedia) {
      setBrowserUnsupported(true);
      return;
    }

    loadJitsiApi()
      .then(() => {
        if (disposed || !containerRef.current || !window.JitsiMeetExternalAPI) return;
        api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName,
          parentNode: containerRef.current,
          width: "100%",
          height: 640,
          userInfo: displayName ? { displayName } : undefined,
          configOverwrite: {
            prejoinConfig: { enabled: false },
            disableAP: true,
            disableAEC: true,
          },
          interfaceConfigOverwrite: {
            MOBILE_APP_PROMO: false,
            SHOW_JITSI_WATERMARK: false,
          },
        });

        api.addListener("videoConferenceJoined", () => {
          if (joinedRef.current) return;
          joinedRef.current = true;
          onFirstJoinRef.current();
        });
        api.addListener("errorOccurred", (payload) => {
          if (String(payload ?? "").toLowerCase().includes("webrtc")) {
            setBrowserUnsupported(true);
          }
        });
      })
      .catch(() => {
        if (!disposed && containerRef.current) {
          containerRef.current.textContent = "Unable to load the meeting interface.";
        }
      });

    // @ts-ignore
    window.kickJitsiUser = () => {
      if (api) {
        // @ts-ignore
        api.executeCommand("hangup");
        api.dispose();
      }
    };

    return () => {
      disposed = true;
      api?.dispose();
      // @ts-ignore
      delete window.kickJitsiUser;
    };
  }, [displayName, roomName]);

  if (browserUnsupported) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-lg bg-[#1A1412] px-6 text-center text-[#FFEDDB]">
        <p className="text-lg font-semibold">WebRTC is unavailable in this browser.</p>
        <p className="max-w-md text-sm text-[#DFC1B0]">
          Enable WebRTC and allow camera/microphone access, or open the meeting in Chrome or Edge.
        </p>
      </div>
    );
  }

  return <div ref={containerRef} className="w-full min-h-[640px] overflow-hidden rounded-lg bg-[#1A1412]" />;
}
