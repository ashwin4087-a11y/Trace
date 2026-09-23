import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { OrganizerLayout } from "../../components/layout/OrganizerLayout";
import { organizerAnalytics } from "../../services/analytics.service";

export function OrganizerAnalyticsPage() {
  const query = useQuery({ queryKey: ["analytics", "organizer"], queryFn: organizerAnalytics });
  const data = query.data
    ? [
        { name: "Workshops", value: query.data.workshops },
        { name: "Registrations", value: query.data.registrations },
        { name: "Certificates", value: query.data.certificatesIssued },
      ]
    : [];
  return (
    <OrganizerLayout title="Analytics">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#0f6e56" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </OrganizerLayout>
  );
}
