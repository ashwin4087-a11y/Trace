import { useQuery } from "@tanstack/react-query";
import { OrganizerLayout } from "../../components/layout/OrganizerLayout";
import { Table } from "../../components/common/Table";
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
    <OrganizerLayout title="Participants">
      <Table
        columns={["Name", "Email", "Status"]}
        rows={(query.data ?? []).map((item) => [
          `${item.user?.firstName ?? ""} ${item.user?.lastName ?? ""}`,
          item.user?.email ?? "",
          item.status,
        ])}
      />
    </OrganizerLayout>
  );
}
