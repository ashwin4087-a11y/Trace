import { useState } from "react";
import { OrganizerLayout } from "../../components/layout/OrganizerLayout";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Textarea } from "../../components/common/Textarea";
import { useWorkshopList } from "../../hooks/useWorkshop";
import { api } from "../../services/api";

export function AnnouncementsPage() {
  const workshops = useWorkshopList();
  const workshopId = workshops.data?.[0]?.id ?? "";
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <OrganizerLayout title="Announcements">
      <form
        className="grid max-w-lg gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          await api.post("/announcements", { workshopId, title, body });
          setSent(true);
        }}
      >
        <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} required />
        <Textarea label="Message" value={body} onChange={(event) => setBody(event.target.value)} required />
        <Button type="submit" disabled={!workshopId}>Publish</Button>
      </form>
      {sent ? <p className="mt-3 text-sm">Confirmed participants were notified.</p> : null}
    </OrganizerLayout>
  );
}
