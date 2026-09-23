import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { Loader } from "../../components/common/Loader";
import { ErrorState } from "../../components/common/ErrorState";
import { platformAnalytics } from "../../services/analytics.service";

const LABEL_MAP: Record<string, string> = {
  totalUsers: "Total Users",
  activeUsers: "Active Users",
  totalOrganizers: "Organizers",
  totalWorkshops: "Workshops",
  totalSessions: "Sessions",
  totalEnrollments: "Enrollments",
  certificatesIssued: "Certificates",
  attendanceRate: "Attendance %",
};

const STAT_ICONS: Record<string, string> = {
  totalUsers: "👥",
  activeUsers: "✅",
  totalOrganizers: "🎓",
  totalWorkshops: "📚",
  totalSessions: "📅",
  totalEnrollments: "📋",
  certificatesIssued: "🏅",
  attendanceRate: "📊",
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #DFC1B0",
        borderRadius: 8,
        padding: "8px 14px",
        fontFamily: "Manrope, sans-serif",
        fontSize: 13,
        color: "#1A1412",
      }}
    >
      <p style={{ fontWeight: 700, marginBottom: 2 }}>{label}</p>
      <p style={{ color: "#BF9270" }}>{payload[0].value.toLocaleString()}</p>
    </div>
  );
}

export function AdminDashboardPage() {
  const query = useQuery({
    queryKey: ["analytics", "platform"],
    queryFn: platformAnalytics,
  });

  const chartData = query.data
    ? Object.entries(query.data).map(([key, value]) => ({
        key,
        name: LABEL_MAP[key] ?? key,
        value,
      }))
    : [];

  const statKeys = [
    "totalUsers",
    "activeUsers",
    "totalOrganizers",
    "totalWorkshops",
    "totalSessions",
    "certificatesIssued",
  ];

  return (
    <AdminLayout title="Platform Governance Overview">
      {query.isLoading && <Loader label="Loading platform analytics…" />}
      {query.isError && (
        <ErrorState message="Unable to load platform analytics." />
      )}

      {query.data && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            {statKeys.map((key) => {
              const raw = query.data[key] ?? 0;
              const display =
                key === "attendanceRate"
                  ? `${raw}%`
                  : Number(raw).toLocaleString();
              return (
                <div
                  key={key}
                  className="bg-white border border-[#DFC1B0] rounded-2xl px-5 py-6 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="text-2xl">{STAT_ICONS[key] ?? "📌"}</span>
                  <span
                    className="font-serif text-3xl font-bold text-[#1A1412]"
                    style={{ fontFamily: "EB Garamond, Georgia, serif" }}
                  >
                    {display}
                  </span>
                  <span
                    className="text-xs font-semibold uppercase tracking-widest text-[#BF9270]"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    {LABEL_MAP[key] ?? key}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Chart */}
          <div className="bg-white border border-[#DFC1B0] rounded-2xl p-6 shadow-sm">
            <div className="mb-6">
              <h2
                className="font-serif text-xl font-bold text-[#1A1412]"
                style={{ fontFamily: "EB Garamond, Georgia, serif" }}
              >
                Platform Telemetry
              </h2>
              <p
                className="text-sm text-[#261D1A]/60 mt-1"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Live aggregate counts across all platform entities
              </p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#DFC1B0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 11,
                      fill: "#261D1A",
                      fontFamily: "Manrope, sans-serif",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fontSize: 11,
                      fill: "#261D1A",
                      fontFamily: "Manrope, sans-serif",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="value"
                    fill="#BF9270"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={56}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                href: "/admin/users",
                icon: "👥",
                title: "Manage Users",
                desc: "Suspend, activate, or reassign roles",
              },
              {
                href: "/admin/organizers",
                icon: "🎓",
                title: "Organizers",
                desc: "Provision and review organizer accounts",
              },
              {
                href: "/admin/organizations",
                icon: "🏛️",
                title: "Organizations",
                desc: "Add and toggle institution status",
              },
              {
                href: "/admin/audit-logs",
                icon: "📜",
                title: "Audit Logs",
                desc: "Immutable chronicle of all platform actions",
              },
            ].map((card) => (
              <a
                key={card.href}
                href={card.href}
                className="bg-white border border-[#DFC1B0] rounded-2xl p-5 flex items-start gap-4 hover:border-[#BF9270] hover:shadow-md transition-all group"
                style={{ textDecoration: "none" }}
              >
                <span className="text-3xl mt-0.5">{card.icon}</span>
                <div>
                  <p
                    className="font-semibold text-sm text-[#1A1412] group-hover:text-[#BF9270] transition-colors"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    {card.title}
                  </p>
                  <p
                    className="text-xs text-[#261D1A]/60 mt-0.5"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    {card.desc}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
