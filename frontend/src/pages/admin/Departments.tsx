import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { createDepartment, listDepartments, listOrganizations, setDepartmentStatus } from "../../services/organization.service";

export function DepartmentsPage() {
  const client = useQueryClient();
  const organizations = useQuery({ queryKey: ["organizations"], queryFn: listOrganizations });
  const departments = useQuery({ queryKey: ["departments"], queryFn: () => listDepartments() });
  const [organizationId, setOrganizationId] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const mutation = useMutation({
    mutationFn: () => createDepartment({ organizationId, name, code }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["departments"] }),
  });
  return (
    <AdminLayout title="Departments">
      <form className="mb-4 grid max-w-md gap-3" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
        <Select label="Organization" value={organizationId} onChange={(event) => setOrganizationId(event.target.value)} required>
          <option value="">Select</option>
          {organizations.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Select>
        <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} required />
        <Input label="Code" value={code} onChange={(event) => setCode(event.target.value)} required />
        <Button type="submit">Add department</Button>
      </form>
      <ul className="space-y-2 text-sm">{departments.data?.map((item) => <li key={item.id} className="flex items-center justify-between rounded border border-line p-3"><span>{item.code} · {item.name} · {item.status}</span><Button variant={item.status === "ACTIVE" ? "danger" : "secondary"} onClick={() => setDepartmentStatus(item.id, item.status === "ACTIVE" ? "DEACTIVATED" : "ACTIVE").then(() => client.invalidateQueries({ queryKey: ["departments"] }))}>{item.status === "ACTIVE" ? "Deactivate" : "Activate"}</Button></li>)}</ul>
    </AdminLayout>
  );
}
