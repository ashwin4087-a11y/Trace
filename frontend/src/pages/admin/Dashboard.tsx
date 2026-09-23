import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { platformAnalytics } from "../../services/analytics.service";

export function AdminDashboardPage() {
  const query = useQuery({ queryKey: ["analytics", "platform"], queryFn: platformAnalytics });
  const data = query.data
    ? Object.entries(query.data).map(([name, value]) => ({ name, value }))
    : [];
  return (
    <AdminLayout title="Platform overview">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#0f6e56" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AdminLayout>
  );
}
