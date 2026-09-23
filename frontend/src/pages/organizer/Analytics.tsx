import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { OrganizerLayout } from "../../components/layout/OrganizerLayout";
import { Loader } from "../../components/common/Loader";
import { organizerAnalytics } from "../../services/analytics.service";

const TERRACOTTA = "#BF9270";
const TERRACOTTA_DARK = "#A87558";
const CANVAS = "#FFEDDB";
const INK = "#1A1412";
const BORDER = "#DFC1B0";
const BAR_COLORS = [TERRACOTTA, TERRACOTTA_DARK, "#8B6350"];

interface StatCardProps {
  label: string;
  value: number | string;
  sub: string;
  accentColor?: string;
}

function StatCard({ label, value, sub, accentColor = TERRACOTTA }: StatCardProps) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        boxShadow: "0 1px 4px rgba(26,20,18,0.06)",
      }}
    >
      <span
        style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: accentColor,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'EB Garamond', Georgia, serif",
          fontSize: 36,
          fontWeight: 600,
          color: INK,
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: 12,
          color: "#6B5448",
        }}
      >
        {sub}
      </span>
    </div>
  );
}

function TraceTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        padding: "10px 16px",
        fontFamily: "'Manrope', sans-serif",
        boxShadow: "0 4px 16px rgba(26,20,18,0.12)",
      }}
    >
      <p style={{ fontSize: 12, fontWeight: 700, color: TERRACOTTA, marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 14, color: INK, fontWeight: 600 }}>{payload[0].value}</p>
    </div>
  );
}

export function OrganizerAnalyticsPage() {
  const query = useQuery({
    queryKey: ["analytics", "organizer"],
    queryFn: organizerAnalytics,
  });

  const data = query.data
    ? [
        { name: "Workshops", value: query.data.workshops },
        { name: "Registrations", value: query.data.registrations },
        { name: "Certificates", value: query.data.certificatesIssued },
      ]
    : [];

  return (
    <OrganizerLayout title="Analytics">
      <div
        style={{
          borderBottom: `1px solid ${BORDER}`,
          paddingBottom: 16,
          marginBottom: 28,
        }}
      >
        <p
          style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: TERRACOTTA,
            marginBottom: 4,
          }}
        >
          Organizer Dashboard
        </p>
        <h1
          style={{
            fontFamily: "'EB Garamond', Georgia, serif",
            fontSize: 28,
            fontWeight: 600,
            color: INK,
            margin: 0,
          }}
        >
          Platform Analytics
        </h1>
        <p
          style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: 13,
            color: "#6B5448",
            marginTop: 4,
          }}
        >
          A summary of workshops, registrations, and certificates issued on TRACE.
        </p>
      </div>

      {query.isLoading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
          <Loader />
        </div>
      )}

      {query.isError && (
        <div
          style={{
            background: "#FFF0EE",
            border: "1px solid #F5C6C0",
            borderRadius: 8,
            padding: "16px 20px",
            fontFamily: "'Manrope', sans-serif",
            fontSize: 13,
            color: "#A83228",
          }}
        >
          Failed to load analytics. Please refresh the page.
        </div>
      )}

      {query.data && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 16,
              marginBottom: 32,
            }}
          >
            <StatCard label="Workshops" value={query.data.workshops} sub="Total workshops created" />
            <StatCard
              label="Registrations"
              value={query.data.registrations}
              sub="Participants registered"
              accentColor={TERRACOTTA_DARK}
            />
            <StatCard
              label="Certificates"
              value={query.data.certificatesIssued}
              sub="Issued to participants"
              accentColor="#8B6350"
            />
          </div>

          <div
            style={{
              background: "#FFFFFF",
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              padding: "24px",
              boxShadow: "0 1px 4px rgba(26,20,18,0.06)",
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <span
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: TERRACOTTA,
                }}
              >
                Overview
              </span>
              <h2
                style={{
                  fontFamily: "'EB Garamond', Georgia, serif",
                  fontSize: 20,
                  fontWeight: 600,
                  color: INK,
                  margin: "2px 0 0",
                }}
              >
                Activity Summary
              </h2>
            </div>

            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 8 }} barSize={48}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, fill: "#6B5448" }}
                    axisLine={{ stroke: BORDER }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, fill: "#6B5448" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<TraceTooltip />} cursor={{ fill: CANVAS }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div
              style={{
                display: "flex",
                gap: 20,
                marginTop: 12,
                paddingTop: 12,
                borderTop: `1px solid ${BORDER}`,
                flexWrap: "wrap",
              }}
            >
              {data.map((entry, index) => (
                <div
                  key={entry.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: 12,
                    color: "#6B5448",
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: BAR_COLORS[index % BAR_COLORS.length],
                      flexShrink: 0,
                    }}
                  />
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </OrganizerLayout>
  );
}
