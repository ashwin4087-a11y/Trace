import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { Button } from "../../components/common/Button";
import { ErrorState } from "../../components/common/ErrorState";
import { Input } from "../../components/common/Input";
import { errorText } from "../../lib/errors";
import { createOrganizer, listUsers } from "../../services/user.service";

export function OrganizersPage() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["users", "ORGANIZER"], queryFn: () => listUsers({ role: "ORGANIZER" }) });
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const mutation = useMutation({
    mutationFn: () => createOrganizer(form),
    onSuccess: () => client.invalidateQueries({ queryKey: ["users", "ORGANIZER"] }),
  });
  return (
    <AdminLayout title="Organizers">
      <form className="mb-6 grid max-w-lg gap-3" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
        <Input label="First name" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} required />
        <Input label="Last name" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} required />
        <Input label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        <Input label="Temporary password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
        {mutation.isError ? <ErrorState message={errorText(mutation.error)} /> : null}
        <Button type="submit">Create organizer</Button>
      </form>
      <ul className="space-y-2 text-sm">
        {query.data?.map((user) => <li key={user.id}>{user.email} · {user.status}</li>)}
      </ul>
    </AdminLayout>
  );
}
