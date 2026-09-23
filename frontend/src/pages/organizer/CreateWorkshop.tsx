import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OrganizerLayout } from "../../components/layout/OrganizerLayout";
import { ErrorState } from "../../components/common/ErrorState";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Textarea } from "../../components/common/Textarea";
import { TraceButton } from "../../components/trace/TraceButton";
import { errorText } from "../../lib/errors";
import { createWorkshop, publishWorkshop } from "../../services/workshop.service";

const empty = {
  title: "",
  description: "",
  category: "Cybersecurity",
  domain: "ENGINEERING",
  level: "BEGINNER",
  skills: "Linux, Networking",
  trainerName: "",
  startDate: "",
  endDate: "",
  durationHours: "",
  mode: "ONLINE",
  capacity: "30",
  registrationDeadline: "",
  language: "EN_TA",
  meetingUrl: "",
  priceCents: "0",
};

function datePart(value: string) {
  return value.split("T")[0] ?? "";
}

function timePart(value: string) {
  return value.split("T")[1] ?? "";
}

function combineDateTime(date: string, time: string) {
  return date && time ? `${date}T${time}` : "";
}

export function CreateWorkshopPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const set = (key: keyof typeof empty, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const durationHours = form.startDate && form.endDate
    ? Math.max(0, (new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / 3_600_000)
    : 0;

  const submitWorkshop = async (publish = false) => {
    setError("");
    setSubmitting(true);
    try {
      const created = await createWorkshop({
        ...form,
        skills: form.skills.split(",").map((item) => item.trim()).filter(Boolean),
        durationHours,
        capacity: Number(form.capacity),
        priceCents: Number(form.priceCents),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        registrationDeadline: new Date(form.registrationDeadline).toISOString(),
        meetingUrl: form.meetingUrl || null,
      });
      if (publish) await publishWorkshop(created.id);
      navigate(`/organizer/workshops/${created.id}`);
    } catch (caught) {
      setError(errorText(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OrganizerLayout title="Create Workshop Curriculum">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <form
          className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-8 shadow-xs flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            void submitWorkshop();
          }}
        >
          <div className="border-b border-[#DFC1B0]/60 pb-4">
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">
              Curricular Builder
            </span>
            <h3 className="font-serif text-2xl text-[#1A1412] font-semibold mt-0.5">
              Workshop Metadata & Configuration
            </h3>
          </div>

          <Input label="Workshop Title" value={form.title} onChange={(event) => set("title", event.target.value)} required />
          <Textarea label="Curriculum Description" value={form.description} onChange={(event) => set("description", event.target.value)} required />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Category" value={form.category} onChange={(event) => set("category", event.target.value)} required />
            <Select label="Domain" value={form.domain} onChange={(event) => set("domain", event.target.value)}>
              <option value="ENGINEERING">Engineering & Technology</option>
              <option value="ARTS_SCIENCE">Arts & Science</option>
              <option value="TAMIL_LANGUAGE">Tamil & Language</option>
              <option value="OTHER">Interdisciplinary</option>
            </Select>
            <Select label="Level" value={form.level} onChange={(event) => set("level", event.target.value)}>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Instructor / Faculty Name" value={form.trainerName} onChange={(event) => set("trainerName", event.target.value)} required />
            <Input label="Target Skills (comma-separated)" value={form.skills} onChange={(event) => set("skills", event.target.value)} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {([
              ["startDate", "Start"],
              ["endDate", "End"],
              ["registrationDeadline", "Registration Deadline"],
            ] as const).map(([key, label]) => (
              <fieldset key={key} className="min-w-0">
                <legend className="mb-1 block text-sm font-semibold">{label}</legend>
                <div className="grid grid-cols-2 gap-2">
                  <Input aria-label={`${label} date`} label="Date" type="date" value={datePart(form[key])} onChange={(event) => set(key, combineDateTime(event.target.value, timePart(form[key])))} required />
                  <Input aria-label={`${label} time`} label="Time" type="time" value={timePart(form[key])} onChange={(event) => set(key, combineDateTime(datePart(form[key]), event.target.value))} required />
                </div>
              </fieldset>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Input label="Duration (Hours)" type="number" value={durationHours ? durationHours.toFixed(2) : ""} readOnly placeholder="Set start and end" />
            <Input label="Seat Capacity" type="number" value={form.capacity} onChange={(event) => set("capacity", event.target.value)} />
            <Select label="Delivery Mode" value={form.mode} onChange={(event) => set("mode", event.target.value)}>
              <option value="ONLINE">Online Virtual</option>
              <option value="OFFLINE">In-Person Campus</option>
              <option value="HYBRID">Hybrid Mode</option>
            </Select>
            <Select label="Language" value={form.language} onChange={(event) => set("language", event.target.value)}>
              <option value="EN">English</option>
              <option value="TA">Tamil (தமிழ்)</option>
              <option value="EN_TA">Bilingual (English + தமிழ்)</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Virtual Meeting URL (optional)" placeholder="https://..." value={form.meetingUrl} onChange={(event) => set("meetingUrl", event.target.value)} />
            <Input label="Price (in paise, 0 for Free)" type="number" value={form.priceCents} onChange={(event) => set("priceCents", event.target.value)} />
          </div>

          {error ? <ErrorState message={error} /> : null}

          <div className="pt-3 border-t border-[#DFC1B0]/60 flex items-center justify-end gap-3">
            <TraceButton type="button" variant="secondary" onClick={() => navigate("/organizer/workshops")}>
              Cancel
            </TraceButton>
            <TraceButton type="submit" icon="save" disabled={submitting}>
              {submitting ? "Saving..." : "Save Draft Workshop"}
            </TraceButton>
            <TraceButton type="button" icon="publish" disabled={submitting} onClick={() => void submitWorkshop(true)}>
              {submitting ? "Submitting..." : "Submit Workshop"}
            </TraceButton>
          </div>
        </form>
      </div>
    </OrganizerLayout>
  );
}
