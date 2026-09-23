import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { Loader } from "../../components/common/Loader";
import { ErrorState } from "../../components/common/ErrorState";
import { api, unwrap } from "../../services/api";
type AuditRow = {
  id: string;
  action: string;
  entityType: string;
  createdAt: string;
  actor?: { email: string } | null;
};

const ACTION_ICON: Record<string, string> = {
  CREATE: "✨",
  UPDATE: "✏️",
  DELETE: "🗑️",
  SUSPEND: "🚫",
  ACTIVATE: "✅",
  LOGIN: "🔑",
  LOGOUT: "👋",
};

function getActionIcon(action: string) {
  const upper = action.toUpperCase();
  for (const key of Object.keys(ACTION_ICON)) {
    if (upper.includes(key)) return ACTION_ICON[key];
  }
  return "📋";
}

export function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const query = useQuery({
    queryKey: ["audit"],
    queryFn: () => unwrap<AuditRow[]>(api.get("/audit")),
  });

  const rows = query.data?.filter(
    (row) =>
      !search ||
      row.action.toLowerCase().includes(search.toLowerCase()) ||
      row.entityType.toLowerCase().includes(search.toLowerCase()) ||
      (row.actor?.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Platform Audit Chronicle">
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by action, entity, or actor email…"
          className="px-4 py-2.5 rounded-xl border border-[#DFC1B0] bg-white text-sm text-[#1A1412] focus:outline-none focus:border-[#BF9270] w-full max-w-md"
          style={{ fontFamily: "Manrope, sans-serif" }}
        />
      </div>

      {query.isLoading && <Loader label="Loading audit log…" />}
      {query.isError && <ErrorState message="Unable to load audit log." />}
      {!query.isLoading && !query.isError && !rows?.length && (
        <div className="py-12 text-center">
          <p className="text-3xl mb-2">📜</p>
          <p className="text-sm text-[#261D1A]/60" style={{ fontFamily: "Manrope, sans-serif" }}>
            {search ? "No audit entries match this filter." : "No audit events recorded yet."}
          </p>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-[#DFC1B0]" aria-hidden="true" />

        <div className="space-y-4">
          {rows?.map((row) => (
            <div key={row.id} className="relative pl-12">
              {/* dot */}
              <div
                className="absolute left-2.5 top-3 w-3 h-3 rounded-full bg-[#BF9270] border-2 border-white"
                aria-hidden="true"
              />
              <div className="bg-white border border-[#DFC1B0] rounded-2xl px-5 py-4 hover:shadow-sm transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg" aria-hidden="true">
                      {getActionIcon(row.action)}
                    </span>
                    <div>
                      <p
                        className="font-semibold text-sm text-[#1A1412]"
                        style={{ fontFamily: "Manrope, sans-serif" }}
                      >
                        {row.action}
                      </p>
                      <p
                        className="text-xs text-[#261D1A]/60"
                        style={{ fontFamily: "Manrope, sans-serif" }}
                      >
                        Entity: {row.entityType}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-xs text-[#261D1A]/60"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      {new Date(row.createdAt).toLocaleString()}
                    </p>
                    <p
                      className="text-xs text-[#BF9270] font-medium"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      {row.actor?.email ?? "system"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
