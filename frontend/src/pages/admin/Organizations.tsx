import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { createOrganization, listOrganizations, setOrganizationStatus } from "../../services/organization.service";

export function OrganizationsPage() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["organizations"], queryFn: listOrganizations });
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const mutation = useMutation({
    mutationFn: () => createOrganization({ name, code }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["organizations"] }),
  });
  return (
    <AdminLayout title="Organizations">
      <form className="mb-4 grid max-w-md gap-3" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
        <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} required />
        <Input label="Code" value={code} onChange={(event) => setCode(event.target.value)} required />
        <Button type="submit">Add organization</Button>
      </form>
      <ul className="space-y-2 text-sm">{query.data?.map((item) => <li key={item.id} className="flex items-center justify-between rounded border border-line p-3"><span>{item.code} · {item.name} · {item.status}</span><Button variant={item.status === "ACTIVE" ? "danger" : "secondary"} onClick={() => setOrganizationStatus(item.id, item.status === "ACTIVE" ? "DEACTIVATED" : "ACTIVE").then(() => client.invalidateQueries({ queryKey: ["organizations"] }))}>{item.status === "ACTIVE" ? "Deactivate" : "Activate"}</Button></li>)}</ul>
    </AdminLayout>
  );
}
