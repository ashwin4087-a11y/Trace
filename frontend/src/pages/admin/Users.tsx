import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { Button } from "../../components/common/Button";
import { SearchBar } from "../../components/common/SearchBar";
import { listUsers, setUserStatus } from "../../services/user.service";

export function UsersPage() {
  const [search, setSearch] = useState("");
  const query = useQuery({ queryKey: ["users", search], queryFn: () => listUsers({ search }) });
  return (
    <AdminLayout title="Users">
      <SearchBar value={search} onChange={setSearch} />
      <ul className="mt-4 space-y-2">
        {query.data?.map((user) => (
          <li key={user.id} className="flex items-center justify-between rounded border border-line bg-card px-3 py-2 text-sm">
            <span>{user.firstName} {user.lastName} · {user.email} · {user.role} · {user.status}</span>
            {user.status !== "SUSPENDED" ? (
              <Button variant="danger" onClick={() => setUserStatus(user.id, "SUSPENDED").then(() => query.refetch())}>Suspend</Button>
            ) : (
              <Button variant="secondary" onClick={() => setUserStatus(user.id, "ACTIVE").then(() => query.refetch())}>Activate</Button>
            )}
          </li>
        ))}
      </ul>
    </AdminLayout>
  );
}
