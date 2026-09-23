import { useState } from "react";
import { OrganizerLayout } from "../../components/layout/OrganizerLayout";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useWorkshopList } from "../../hooks/useWorkshop";
import { createAssessment } from "../../services/assessment.service";

export function OrganizerAssessmentsPage() {
  const workshops = useWorkshopList();
  const workshopId = workshops.data?.[0]?.id ?? "";
  const [title, setTitle] = useState("Check-in quiz");
  const [prompt, setPrompt] = useState("Which command lists files?");
  const [saved, setSaved] = useState("");
  return (
    <OrganizerLayout title="Assessments">
      <form
        className="grid max-w-lg gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          const created = await createAssessment({
            workshopId,
            title,
            questions: [{ prompt, type: "MCQ", options: ["ls", "rm"], correctIndex: 0, points: 1 }],
          });
          setSaved(created.id);
        }}
      >
        <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
        <Input label="Question" value={prompt} onChange={(event) => setPrompt(event.target.value)} />
        <Button type="submit" disabled={!workshopId}>Create MCQ</Button>
      </form>
      {saved ? <p className="mt-3 text-sm">Assessment {saved} created.</p> : null}
    </OrganizerLayout>
  );
}
