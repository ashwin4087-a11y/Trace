import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OrganizerLayout } from "../../components/layout/OrganizerLayout";
import { Button } from "../../components/common/Button";
import { ErrorState } from "../../components/common/ErrorState";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Textarea } from "../../components/common/Textarea";
import { errorText } from "../../lib/errors";
import { createWorkshop } from "../../services/workshop.service";

const empty = {
  title: "",
  description: "",
  category: "Cybersecurity",
  domain: "ENGINEERING",
  level: "BEGINNER",
  skills: "Linux",
  trainerName: "",
  startDate: "",
  endDate: "",
  durationHours: "6",
  mode: "ONLINE",
  capacity: "30",
  registrationDeadline: "",
  language: "EN_TA",
  meetingUrl: "",
  priceCents: "0",
};

export function CreateWorkshopPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const set = (key: keyof typeof empty, value: string) => setForm((current) => ({ ...current, [key]: value }));
  return (
    <OrganizerLayout title="Create workshop">
      <form
        className="grid max-w-2xl gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          try {
            const created = await createWorkshop({
              ...form,
              skills: form.skills.split(",").map((item) => item.trim()).filter(Boolean),
              durationHours: Number(form.durationHours),
              capacity: Number(form.capacity),
              priceCents: Number(form.priceCents),
              startDate: new Date(form.startDate).toISOString(),
              endDate: new Date(form.endDate).toISOString(),
              registrationDeadline: new Date(form.registrationDeadline).toISOString(),
              meetingUrl: form.meetingUrl || null,
            });
            navigate(`/organizer/workshops/${created.id}`);
          } catch (caught) {
            setError(errorText(caught));
          }
        }}
      >
        <Input label="Title" value={form.title} onChange={(event) => set("title", event.target.value)} required />
        <Textarea label="Description" value={form.description} onChange={(event) => set("description", event.target.value)} required />
        <Input label="Category" value={form.category} onChange={(event) => set("category", event.target.value)} required />
        <Select label="Domain" value={form.domain} onChange={(event) => set("domain", event.target.value)}>
          <option value="ENGINEERING">Engineering</option>
          <option value="ARTS_SCIENCE">Arts & Science</option>
          <option value="TAMIL_LANGUAGE">Tamil / Language</option>
          <option value="OTHER">Other</option>
        </Select>
        <Select label="Level" value={form.level} onChange={(event) => set("level", event.target.value)}>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </Select>
        <Input label="Skills" value={form.skills} onChange={(event) => set("skills", event.target.value)} />
        <Input label="Trainer" value={form.trainerName} onChange={(event) => set("trainerName", event.target.value)} required />
        <Input label="Start" type="datetime-local" value={form.startDate} onChange={(event) => set("startDate", event.target.value)} required />
        <Input label="End" type="datetime-local" value={form.endDate} onChange={(event) => set("endDate", event.target.value)} required />
        <Input label="Registration deadline" type="datetime-local" value={form.registrationDeadline} onChange={(event) => set("registrationDeadline", event.target.value)} required />
        <Input label="Duration hours" type="number" value={form.durationHours} onChange={(event) => set("durationHours", event.target.value)} />
        <Input label="Capacity" type="number" value={form.capacity} onChange={(event) => set("capacity", event.target.value)} />
        <Select label="Mode" value={form.mode} onChange={(event) => set("mode", event.target.value)}>
          <option value="ONLINE">Online</option>
          <option value="OFFLINE">Offline</option>
          <option value="HYBRID">Hybrid</option>
        </Select>
        <Select label="Language" value={form.language} onChange={(event) => set("language", event.target.value)}>
          <option value="EN">English</option>
          <option value="TA">Tamil</option>
          <option value="EN_TA">Tamil + English</option>
        </Select>
        <Input label="Meeting URL" value={form.meetingUrl} onChange={(event) => set("meetingUrl", event.target.value)} />
        <Input label="Price in paise" type="number" value={form.priceCents} onChange={(event) => set("priceCents", event.target.value)} />
        {error ? <ErrorState message={error} /> : null}
        <Button type="submit">Save draft</Button>
      </form>
    </OrganizerLayout>
  );
}
