import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OrganizerLayout } from "../../components/layout/OrganizerLayout";
import { Loader } from "../../components/common/Loader";
import { TraceBadge } from "../../components/trace/TraceBadge";
import { TraceButton } from "../../components/trace/TraceButton";
import { useWorkshopList } from "../../hooks/useWorkshop";
import { publishWorkshop } from "../../services/workshop.service";

export function OrganizerWorkshopsPage() {
  const query = useWorkshopList();
  const client = useQueryClient();
  const publish = useMutation({
    mutationFn: publishWorkshop,
    onSuccess: () => client.invalidateQueries({ queryKey: ["workshops"] }),
  });

  return (
    <OrganizerLayout title="Faculty Workshop Catalogue">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-[#DFC1B0]/60 pb-3">
          <p className="font-sans text-xs text-[#5F524B]">
            Manage, edit, publish, and structure your department workshops and curricular tracks.
          </p>
          <Link to="/organizer/workshops/new">
            <TraceButton icon="add_circle" size="sm">
              Create Workshop
            </TraceButton>
          </Link>
        </div>

        {query.isLoading ? <Loader /> : null}

        {query.data && query.data.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-8 text-center">
            <h3 className="font-serif text-lg font-semibold text-[#1A1412]">No workshops created yet</h3>
            <p className="font-sans text-xs text-[#5F524B] mt-1">Start by designing your first workshop curriculum.</p>
            <Link to="/organizer/workshops/new" className="mt-4 inline-block">
              <TraceButton size="sm">Create Workshop</TraceButton>
            </Link>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {query.data?.map((workshop) => (
            <div
              key={workshop.id}
              className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs flex flex-col justify-between gap-4"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <TraceBadge variant={workshop.status === "PUBLISHED" ? "terracotta" : "cream"}>
                    {workshop.status}
                  </TraceBadge>
                  <span className="font-sans text-xs text-[#5F524B]">
                    {workshop.mode || "Online"}
                  </span>
                </div>
                <Link
                  to={`/organizer/workshops/${workshop.id}`}
                  className="font-serif text-xl text-[#1A1412] font-semibold hover:text-[#BF9270] transition-colors"
                >
                  {workshop.title}
                </Link>
                <p className="font-sans text-xs text-[#5F524B] line-clamp-2">
                  {workshop.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#DFC1B0]/40 flex items-center justify-between gap-2">
                <Link to={`/organizer/workshops/${workshop.id}/edit`}>
                  <TraceButton variant="secondary" size="sm" icon="edit">
                    Edit
                  </TraceButton>
                </Link>

                {workshop.status === "DRAFT" ? (
                  <TraceButton
                    size="sm"
                    disabled={publish.isPending}
                    onClick={() => publish.mutate(workshop.id)}
                    icon="publish"
                  >
                    {publish.isPending ? "Publishing..." : "Publish Workshop"}
                  </TraceButton>
                ) : (
                  <Link to={`/organizer/workshops/${workshop.id}`}>
                    <TraceButton variant="ghost" size="sm" icon="arrow_forward">
                      View Details
                    </TraceButton>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </OrganizerLayout>
  );
}
