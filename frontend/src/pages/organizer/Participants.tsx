import { useQuery } from "@tanstack/react-query";
import { OrganizerLayout } from "../../components/layout/OrganizerLayout";
import { Loader } from "../../components/common/Loader";
import { TraceBadge } from "../../components/trace/TraceBadge";
import { useWorkshopList } from "../../hooks/useWorkshop";
import { workshopRegistrations } from "../../services/registration.service";

export function ParticipantsPage() {
  const workshops = useWorkshopList();
  const workshopId = workshops.data?.[0]?.id;
  const query = useQuery({
    queryKey: ["registrations", workshopId],
    queryFn: () => workshopRegistrations(workshopId!),
    enabled: Boolean(workshopId),
  });

  return (
    <OrganizerLayout title="Participant Roster & Enrolments">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-[#DFC1B0]/60 pb-3">
          <div>
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">
              Enrolled Scholars
            </span>
            <h3 className="font-serif text-xl font-semibold text-[#1A1412] mt-0.5">
              {workshops.data?.[0]?.title || "Workshop Roster"}
            </h3>
          </div>
          <TraceBadge variant="cream">{query.data?.length ?? 0} Scholars Enrolled</TraceBadge>
        </div>

        {query.isLoading ? <Loader /> : null}

        <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs">
          {query.data && query.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#DFC1B0]/60 text-[#5F524B] uppercase tracking-wider font-bold">
                    <th className="py-3 px-3">Scholar Name</th>
                    <th className="py-3 px-3">Email Address</th>
                    <th className="py-3 px-3">Enrolment Status</th>
                    <th className="py-3 px-3">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFC1B0]/40">
                  {query.data.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FFEDDB]/30 transition-colors">
                      <td className="py-3 px-3 font-semibold text-[#1A1412]">
                        {item.user?.firstName} {item.user?.lastName}
                      </td>
                      <td className="py-3 px-3 text-[#5F524B]">{item.user?.email}</td>
                      <td className="py-3 px-3">
                        <TraceBadge variant={item.status === "CONFIRMED" ? "terracotta" : "cream"}>
                          {item.status}
                        </TraceBadge>
                      </td>
                      <td className="py-3 px-3 text-[#5F524B] font-mono text-[11px]">
                        {"—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="font-sans text-xs text-[#5F524B] text-center">No participants registered yet for this workshop.</p>
          )}
        </div>
      </div>
    </OrganizerLayout>
  );
}
