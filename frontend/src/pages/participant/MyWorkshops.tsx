import { Link } from "react-router-dom";
import { ParticipantLayout } from "../../components/layout/ParticipantLayout";
import { ErrorState } from "../../components/common/ErrorState";
import { Loader } from "../../components/common/Loader";
import { TraceBadge } from "../../components/trace/TraceBadge";
import { TraceButton } from "../../components/trace/TraceButton";
import { TraceEmptyState } from "../../components/trace/TraceEmptyState";
import { useRegistration } from "../../hooks/useRegistration";
import { errorText } from "../../lib/errors";

export function MyWorkshopsPage() {
  const query = useRegistration();

  return (
    <ParticipantLayout title="My Registered Workshops">
      <div className="flex flex-col gap-6">
        <p className="font-sans text-xs text-[#5F524B]">
          Track your enrolled workshops, access interactive learning materials, and view session status.
        </p>

        {query.isLoading ? <Loader /> : null}
        {query.isError ? <ErrorState message={errorText(query.error)} /> : null}
        {query.data && query.data.length === 0 ? (
          <TraceEmptyState
            icon="school"
            title="You have not registered for any workshops yet"
            description="Explore our accredited workshops catalog to begin your academic trajectory."
            actionLabel="Discover Workshops"
            onAction={() => window.location.href = "/workshops"}
          />
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {query.data?.map((item) => (
            <div
              key={item.id}
              className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs flex flex-col justify-between gap-4"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <TraceBadge variant={item.status === "CONFIRMED" ? "terracotta" : "cream"}>
                    {item.status}
                  </TraceBadge>
                  <span className="font-sans text-xs text-[#5F524B]">
                    {item.workshop?.mode || "Online"}
                  </span>
                </div>
                <h3 className="font-serif text-xl text-[#1A1412] font-semibold mt-1">
                  {item.workshop?.title}
                </h3>
                <p className="font-sans text-xs text-[#5F524B] line-clamp-2">
                  {item.workshop?.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#DFC1B0]/40 flex items-center justify-between">
                <span className="font-sans text-xs text-[#BF9270] font-medium">
                  {item.workshop?.trainerName ? `Faculty: ${item.workshop.trainerName}` : "Academic Track"}
                </span>
                <Link to={`/participant/workshops/${item.workshopId}/learn`}>
                  <TraceButton size="sm" icon="play_circle">
                    Open Workshop →
                  </TraceButton>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ParticipantLayout>
  );
}

