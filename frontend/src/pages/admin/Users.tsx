import { useEffect, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { Button } from "../../components/common/Button";
import { SearchBar } from "../../components/common/SearchBar";
import { ErrorState } from "../../components/common/ErrorState";
import { Loader } from "../../components/common/Loader";
import { useAuth } from "../../context/AuthContext";
import { assignUserRole, getUser, listUsers, setUserStatus, updateUser } from "../../services/user.service";
import type { AccountStatus, Role } from "../../types/auth";

export function UsersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AccountStatus | "">("");
  const [role, setRole] = useState<Role | "">("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const { hasPermission } = useAuth();
  const query = useQuery({
    queryKey: ["users", search, status, role],
    queryFn: () => listUsers({ search: search || undefined, status: status || undefined, role: role || undefined }),
  });
  const detail = useQuery({
    queryKey: ["user", selectedId],
    queryFn: () => getUser(selectedId!),
    enabled: Boolean(selectedId),
  });
  const selected = detail.data;
  const canUpdate = hasPermission("user.write");
  const canChangeStatus = hasPermission("user.suspend");
  const canChangeRole = hasPermission("role.write");

  useEffect(() => {
    setNotice("");
  }, [selectedId]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !canUpdate) return;
    const form = new FormData(event.currentTarget);
    await updateUser(selected.id, {
      firstName: String(form.get("firstName") ?? ""),
      lastName: String(form.get("lastName") ?? ""),
      name: String(form.get("name") ?? "") || null,
      phone: String(form.get("phone") ?? "") || null,
    });
    setNotice("User details updated.");
    await Promise.all([query.refetch(), detail.refetch()]);
  }

  async function changeStatus(nextStatus: AccountStatus) {
    if (!selected || !canChangeStatus) return;
    await setUserStatus(selected.id, nextStatus);
    setNotice(`User ${nextStatus.toLowerCase().replace("_", " ")}.`);
    await Promise.all([query.refetch(), detail.refetch()]);
  }

  async function changeRole(nextRole: Role) {
    if (!selected || !canChangeRole) return;
    await assignUserRole(selected.id, nextRole);
    setNotice("Role updated.");
    await Promise.all([query.refetch(), detail.refetch()]);
  }

  return (
    <AdminLayout title="Users">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <SearchBar value={search} onChange={setSearch} placeholder="Search name or email" />
        <select className="rounded-md border border-line bg-white px-3 py-2 text-sm" value={role} onChange={(event) => setRole(event.target.value as Role | "")}>
          <option value="">All roles</option><option value="ADMIN">Admin</option><option value="ORGANIZER">Organizer</option><option value="PARTICIPANT">Participant</option>
        </select>
        <select className="rounded-md border border-line bg-white px-3 py-2 text-sm" value={status} onChange={(event) => setStatus(event.target.value as AccountStatus | "")}>
          <option value="">All statuses</option><option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option><option value="DEACTIVATED">Deactivated</option><option value="PENDING_VERIFICATION">Pending verification</option>
        </select>
      </div>
      {query.isLoading ? <Loader label="Loading users" /> : null}
      {query.isError ? <ErrorState message="Unable to load users." /> : null}
      {!query.isLoading && !query.isError && !query.data?.length ? <p className="mt-4 text-sm text-ink/70">No users match these filters.</p> : null}
      <ul className="mt-4 space-y-2">
        {query.data?.map((user) => (
          <li key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded border border-line bg-card px-3 py-2 text-sm">
            <button className="text-left" onClick={() => setSelectedId(user.id)}>
              <strong>{user.name || `${user.firstName} ${user.lastName}`}</strong><br />
              <span className="text-ink/70">{user.email} · {user.roles.join(", ")} · {user.status}</span>
            </button>
            {canChangeStatus && user.status !== "SUSPENDED" ? <Button variant="danger" onClick={() => { setSelectedId(user.id); void setUserStatus(user.id, "SUSPENDED").then(() => query.refetch()); }}>Suspend</Button> : null}
            {canChangeStatus && user.status === "SUSPENDED" ? <Button variant="secondary" onClick={() => { setSelectedId(user.id); void setUserStatus(user.id, "ACTIVE").then(() => query.refetch()); }}>Activate</Button> : null}
          </li>
        ))}
      </ul>
      {selectedId && detail.isLoading ? <Loader label="Loading user details" /> : null}
      {selectedId && detail.isError ? <ErrorState message="Unable to load user details." /> : null}
      {selected ? (
        <section className="mt-6 rounded border border-line bg-card p-4">
          <h2 className="text-lg font-semibold">User details</h2>
          {notice ? <p className="my-2 text-sm text-success">{notice}</p> : null}
          <form className="mt-3 grid gap-3 md:grid-cols-2" onSubmit={(event) => void saveProfile(event)}>
            <label className="grid gap-1 text-sm">Display name<input name="name" defaultValue={selected.name ?? ""} disabled={!canUpdate} className="rounded border border-line px-3 py-2" /></label>
            <label className="grid gap-1 text-sm">Phone<input name="phone" defaultValue={selected.phone ?? ""} disabled={!canUpdate} className="rounded border border-line px-3 py-2" /></label>
            <label className="grid gap-1 text-sm">First name<input name="firstName" defaultValue={selected.firstName} disabled={!canUpdate} className="rounded border border-line px-3 py-2" /></label>
            <label className="grid gap-1 text-sm">Last name<input name="lastName" defaultValue={selected.lastName} disabled={!canUpdate} className="rounded border border-line px-3 py-2" /></label>
            <p className="text-sm">Email: {selected.email}<br />Verified: {selected.emailVerified ? "Yes" : "No"}<br />Roles: {selected.roles.join(", ")}</p>
            <p className="text-sm">Status: {selected.status}<br />Organization: {selected.organization?.name ?? "-"}<br />Department: {selected.department?.name ?? "-"}<br />Created: {new Date(selected.createdAt).toLocaleString()}</p>
            {canUpdate ? <Button type="submit">Save details</Button> : null}
          </form>
          {canChangeRole ? <label className="mt-4 grid max-w-xs gap-1 text-sm">Primary role<select className="rounded border border-line px-3 py-2" value={selected.role} onChange={(event) => void changeRole(event.target.value as Role)}><option value="ADMIN">Admin</option><option value="ORGANIZER">Organizer</option><option value="PARTICIPANT">Participant</option></select></label> : null}
          {canChangeStatus ? <div className="mt-4 flex flex-wrap gap-2"><Button variant="secondary" onClick={() => void changeStatus("ACTIVE")}>Activate</Button><Button variant="danger" onClick={() => void changeStatus("SUSPENDED")}>Suspend</Button><Button variant="danger" onClick={() => void changeStatus("DEACTIVATED")}>Deactivate</Button></div> : null}
        </section>
      ) : null}
    </AdminLayout>
  );
}
