import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { Button } from "../../components/common/Button";
import { ErrorState } from "../../components/common/ErrorState";
import { Input } from "../../components/common/Input";
import { errorText } from "../../lib/errors";
import { createOrganizer, listOrganizers, setOrganizerStatus, updateOrganizer } from "../../services/organizer.service";
import { listDepartments, listOrganizations } from "../../services/organization.service";
import { useAuth } from "../../context/AuthContext";
import type { AccountStatus } from "../../types/auth";
import type { UserRecord } from "../../types/user";

const emptyForm = { firstName: "", lastName: "", email: "", password: "", phone: "", designation: "", departmentId: "" };

export function OrganizersPage() {
  const client = useQueryClient();
  const { hasPermission } = useAuth();
  const canCreate = hasPermission("organizer.create");
  const canWrite = hasPermission("organizer.write");
  const organizations = useQuery({ queryKey: ["organizations"], queryFn: listOrganizations });
  const [organizationId, setOrganizationId] = useState("");
  const departments = useQuery({ queryKey: ["departments", organizationId], queryFn: () => listDepartments(organizationId), enabled: Boolean(organizationId) });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AccountStatus | "">("");
  const query = useQuery({ queryKey: ["organizers", search, status], queryFn: () => listOrganizers({ search: search || undefined, status: status || undefined }) });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      if (editingId) {
        await updateOrganizer(editingId, { firstName: form.firstName, lastName: form.lastName, phone: form.phone || null, designation: form.designation, organizationId, departmentId: form.departmentId });
      } else {
        await createOrganizer({ ...form, phone: form.phone || null, designation: form.designation, organizationId, departmentId: form.departmentId });
      }
      setMessage(editingId ? "Organizer updated." : "Organizer created.");
      setEditingId(null);
      setForm(emptyForm);
      setOrganizationId("");
      await client.invalidateQueries({ queryKey: ["organizers"] });
    } catch (error) {
      setMessage(errorText(error));
    }
  }

  function edit(user: UserRecord) {
    setEditingId(user.id);
    setOrganizationId(user.organizationId ?? "");
    setForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, password: "", phone: user.phone ?? "", designation: user.designation ?? "", departmentId: user.departmentId ?? "" });
  }

  async function changeStatus(id: string, nextStatus: AccountStatus) {
    if (nextStatus === "DEACTIVATED" && !window.confirm("Deactivate this organizer?")) return;
    await setOrganizerStatus(id, nextStatus);
    await client.invalidateQueries({ queryKey: ["organizers"] });
  }

  return (
    <AdminLayout title="Organizers">
      {canCreate || canWrite ? <form className="mb-6 grid max-w-lg gap-3" onSubmit={(event) => void submit(event)}>
        <Input label="First name" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} required />
        <Input label="Last name" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} required />
        <Input label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required disabled={Boolean(editingId)} />
        {!editingId ? <Input label="Temporary password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /> : null}
        <Input label="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        <Input label="Designation" value={form.designation} onChange={(event) => setForm({ ...form, designation: event.target.value })} required />
        <label className="grid gap-1 text-sm">Organization<select className="rounded border border-line px-3 py-2" value={organizationId} onChange={(event) => { setOrganizationId(event.target.value); setForm({ ...form, departmentId: "" }); }} required><option value="">Select organization</option>{organizations.data?.filter((item) => item.status === "ACTIVE").map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="grid gap-1 text-sm">Department<select className="rounded border border-line px-3 py-2" value={form.departmentId} onChange={(event) => setForm({ ...form, departmentId: event.target.value })} required><option value="">Select department</option>{departments.data?.filter((item) => item.status === "ACTIVE").map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        {message ? <p className="text-sm">{message}</p> : null}
        <Button type="submit">{editingId ? "Save organizer" : "Create organizer"}</Button>
      </form> : null}
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto]"><Input label="Search" value={search} onChange={(event) => setSearch(event.target.value)} /><select className="rounded border border-line px-3 py-2" value={status} onChange={(event) => setStatus(event.target.value as AccountStatus | "")}><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option><option value="DEACTIVATED">Deactivated</option></select></div>
      {query.isLoading ? <p className="text-sm">Loading organizers...</p> : null}
      {query.isError ? <ErrorState message="Unable to load organizers." /> : null}
      {!query.isLoading && !query.data?.length ? <p className="text-sm">No organizers found.</p> : null}
      <ul className="space-y-2 text-sm">
        {query.data?.map((user) => <li key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded border border-line bg-card p-3"><span><strong>{user.name || `${user.firstName} ${user.lastName}`}</strong> · {user.email}<br />{user.phone || "No phone"} · {user.designation || "No designation"} · {user.organization?.name || "No organization"} / {user.department?.name || "No department"} · {user.status}</span>{canWrite ? <span className="flex gap-2"><Button variant="secondary" onClick={() => edit(user)}>Edit</Button><Button variant={user.status === "ACTIVE" ? "danger" : "secondary"} onClick={() => void changeStatus(user.id, user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE")}>{user.status === "ACTIVE" ? "Suspend" : "Activate"}</Button><Button variant="danger" onClick={() => void changeStatus(user.id, "DEACTIVATED")}>Deactivate</Button></span> : null}</li>)}
      </ul>
    </AdminLayout>
  );
}
