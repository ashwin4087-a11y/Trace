import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { api, unwrap } from "../../services/api";

type Settings = { platformName: string; certificateMinPercent: number; maintenanceMode: boolean; timezone: string };

export function SettingsPage() {
  const query = useQuery({ queryKey: ["settings"], queryFn: () => unwrap<Settings>(api.get("/settings")) });
  const [name, setName] = useState("");
  const [percent, setPercent] = useState("90");
  const mutation = useMutation({
    mutationFn: (body: Partial<Settings>) => unwrap(api.patch("/settings", body)),
  });
  const settings = query.data;
  return (
    <AdminLayout title="Settings">
      {settings ? <p className="mb-3 text-sm">Current threshold {settings.certificateMinPercent}% · {settings.timezone}</p> : null}
      <form
        className="grid max-w-md gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate({ platformName: name || settings?.platformName, certificateMinPercent: Number(percent) });
        }}
      >
        <Input label="Platform name" value={name} placeholder={settings?.platformName} onChange={(event) => setName(event.target.value)} />
        <Input label="Certificate minimum percent" type="number" value={percent} onChange={(event) => setPercent(event.target.value)} />
        <Button type="submit">Save</Button>
        <Button type="button" variant="secondary" onClick={() => mutation.mutate({ maintenanceMode: !settings?.maintenanceMode })}>
          Toggle maintenance mode
        </Button>
      </form>
    </AdminLayout>
  );
}
