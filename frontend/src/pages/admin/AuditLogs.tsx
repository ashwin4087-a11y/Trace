import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { api, unwrap } from "../../services/api";

type AuditRow = { id: string; action: string; entityType: string; createdAt: string; actor?: { email: string } | null };

export function AuditLogsPage() {
  const query = useQuery({ queryKey: ["audit"], queryFn: () => unwrap<AuditRow[]>(api.get("/audit")) });
  return (
    <AdminLayout title="Audit logs">
      <ul className="space-y-2 text-sm">
        {query.data?.map((row) => (
          <li key={row.id}>{new Date(row.createdAt).toLocaleString()} · {row.action} · {row.entityType} · {row.actor?.email ?? "system"}</li>
        ))}
      </ul>
    </AdminLayout>
  );
}
