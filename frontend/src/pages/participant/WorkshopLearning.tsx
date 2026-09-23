import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ParticipantLayout } from "../../components/layout/ParticipantLayout";
import { MaterialList } from "../../components/learning/MaterialList";
import { Loader } from "../../components/common/Loader";
import { TraceBadge } from "../../components/trace/TraceBadge";
import { TraceButton } from "../../components/trace/TraceButton";
import { listMaterials } from "../../services/learning.service";
import { listSessions } from "../../services/session.service";

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
              {sessions.data.map((session, idx) => (
                <div
                  key={session.id}
                  className="p-4 bg-[#FFEDDB]/40 border border-[#DFC1B0]/60 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-[#BF9270] uppercase">Session {idx + 1}</span>
                    <h4 className="font-semibold text-sm text-[#1A1412] mt-0.5">{session.title}</h4>
                    {session.startTime && (
                      <p className="text-[#5F524B] mt-0.5">
                        {new Date(session.startTime).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {session.meetingUrl ? (
                    <a href={session.meetingUrl} target="_blank" rel="noopener noreferrer">
                      <TraceButton size="sm" icon="video_camera_front">
                        Join Virtual Session
                      </TraceButton>
                    </a>
                  ) : (
                    <span className="text-[#5F524B] italic">Venue/Link Pending</span>
                  )}
                </div>
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
