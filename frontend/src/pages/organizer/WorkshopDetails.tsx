import { useParams, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OrganizerLayout } from "../../components/layout/OrganizerLayout";
import { Loader } from "../../components/common/Loader";
import { TraceBadge } from "../../components/trace/TraceBadge";
import { TraceButton } from "../../components/trace/TraceButton";
import { useWorkshop } from "../../hooks/useWorkshop";
import { completeWorkshop, publishWorkshop } from "../../services/workshop.service";

export function OrganizerWorkshopDetailsPage() {
  const { id = "" } = useParams();
  const query = useWorkshop(id);
  const client = useQueryClient();

  const publish = useMutation({
    mutationFn: () => publishWorkshop(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ["workshop", id] }),
  });

  const complete = useMutation({
    mutationFn: () => completeWorkshop(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ["workshop", id] }),
  });

  const workshop = query.data;

  return (
    <OrganizerLayout title={workshop?.title ?? "Workshop Overview"}>
      <div className="flex flex-col gap-6">
        {query.isLoading ? <Loader /> : null}

        {workshop ? (
          <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-8 shadow-xs flex flex-col gap-6 max-w-4xl">
            <div className="border-b border-[#DFC1B0]/60 pb-6 flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <TraceBadge variant={workshop.status === "PUBLISHED" ? "terracotta" : "cream"}>
                  {workshop.status}
                </TraceBadge>
                <TraceBadge variant="default">{workshop.mode || "ONLINE"}</TraceBadge>
                {workshop.domain && <TraceBadge variant="cream">{workshop.domain}</TraceBadge>}
              </div>

              <h2 className="font-serif text-3xl md:text-4xl text-[#1A1412] font-normal">
                {workshop.title}
              </h2>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-[#1A1412] mb-2">Curriculum Description</h3>
              <p className="font-sans text-sm text-[#5F524B] leading-relaxed whitespace-pre-wrap">
                {workshop.description}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#FFEDDB]/40 p-4 rounded-lg border border-[#DFC1B0]/60 text-xs">
              <div>
                <span className="text-[#5F524B] uppercase tracking-wider font-semibold block">Faculty</span>
                <span className="text-[#1A1412] font-semibold text-sm">{workshop.trainerName || "Staff"}</span>
              </div>
              <div>
                <span className="text-[#5F524B] uppercase tracking-wider font-semibold block">Level</span>
                <span className="text-[#1A1412] font-semibold text-sm">{workshop.level || "All"}</span>
              </div>
              <div>
                <span className="text-[#5F524B] uppercase tracking-wider font-semibold block">Capacity</span>
                <span className="text-[#1A1412] font-semibold text-sm">{workshop.capacity} Seats</span>
              </div>
              <div>
                <span className="text-[#5F524B] uppercase tracking-wider font-semibold block">Price</span>
                <span className="text-[#1A1412] font-semibold text-sm">
                  {workshop.priceCents === 0 ? "Free" : `$${(workshop.priceCents / 100).toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#DFC1B0]/60 flex flex-wrap items-center justify-between gap-3">
              <Link to={`/organizer/workshops/${id}/edit`}>
                <TraceButton variant="secondary" size="sm" icon="edit">
                  Edit Metadata
                </TraceButton>
              </Link>

              <div className="flex items-center gap-2">
                {workshop.status === "DRAFT" ? (
                  <TraceButton
                    disabled={publish.isPending}
                    onClick={() => publish.mutate()}
                    icon="publish"
                  >
                    {publish.isPending ? "Publishing..." : "Publish Workshop"}
                  </TraceButton>
                ) : null}

                {workshop.status === "PUBLISHED" ? (
                  <TraceButton
                    variant="secondary"
                    disabled={complete.isPending}
                    onClick={() => complete.mutate()}
                    icon="check_circle"
                  >
                    {complete.isPending ? "Updating..." : "Mark Completed"}
                  </TraceButton>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </OrganizerLayout>
  );
}
