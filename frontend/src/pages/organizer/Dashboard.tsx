import { useQuery } from "@tanstack/react-query";
import { OrganizerLayout } from "../../components/layout/OrganizerLayout";
import { StatGrid } from "../../components/analytics/StatGrid";
import { organizerAnalytics } from "../../services/analytics.service";

export function OrganizerDashboardPage() {
  const query = useQuery({ queryKey: ["analytics", "organizer"], queryFn: organizerAnalytics });
  const data = query.data;
  return (
    <OrganizerLayout title="Organizer overview">
      {data ? (
        <StatGrid
          stats={[
            { label: "Workshops", value: data.workshops },
            { label: "Registrations", value: data.registrations },
            { label: "Attendance marks", value: data.attendanceMarks },
            { label: "Certificates", value: data.certificatesIssued },
          ]}
        />
      ) : null}
    </OrganizerLayout>
  );
}
