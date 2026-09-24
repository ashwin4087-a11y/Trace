import { useState } from "react";
import { OrganizerLayout } from "../../components/layout/OrganizerLayout";
import { ErrorState } from "../../components/common/ErrorState";
import { Input } from "../../components/common/Input";
import { TraceButton } from "../../components/trace/TraceButton";
import { useWorkshopList } from "../../hooks/useWorkshop";
import { createAssessment } from "../../services/assessment.service";
import { useWorkshopContext } from "../../hooks/useWorkshopContext";
import { WorkshopSelector } from "../../components/common/WorkshopSelector";

export function OrganizerAssessmentsPage() {
  const workshops = useWorkshopList({ mine: 1 });
  const { workshopId, setWorkshopId } = useWorkshopContext(workshops.data);
  const [title, setTitle] = useState("Module Check-in Quiz");
  const [prompt, setPrompt] = useState("Which command lists files in a directory?");
  const [opt1, setOpt1] = useState("ls");
  const [opt2, setOpt2] = useState("cd");
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");

  return (
    <OrganizerLayout title="Faculty Assessment Builder">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <WorkshopSelector 
          workshops={workshops.data} 
          selectedId={workshopId} 
          onSelect={setWorkshopId} 
          isLoading={workshops.isLoading} 
        />
        <form
          className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-8 shadow-xs flex flex-col gap-5"
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            setSaved("");
            try {
              const created = await createAssessment({
                workshopId,
                title,
                questions: [{ prompt, type: "MCQ", options: [opt1, opt2], correctIndex: 0, points: 1 }],
              });
              setSaved(created.id);
            } catch (caught) {
              setError("Failed to create assessment.");
            }
          }}
        >
          <div className="border-b border-[#DFC1B0]/60 pb-3">
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">
              Evaluation Builder
            </span>
            <h3 className="font-serif text-xl font-semibold text-[#1A1412] mt-0.5">
              Create Multiple Choice Quiz
            </h3>
          </div>

          <Input label="Assessment Title" value={title} onChange={(event) => setTitle(event.target.value)} required />
          <Input label="Question Prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} required />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Option 1 (Correct Answer)" value={opt1} onChange={(event) => setOpt1(event.target.value)} required />
            <Input label="Option 2" value={opt2} onChange={(event) => setOpt2(event.target.value)} required />
          </div>

          {error ? <ErrorState message={error} /> : null}
          {saved ? (
            <div className="p-3 bg-[#FFEDDB] border border-[#BF9270] rounded-lg text-xs font-semibold text-[#1A1412] text-center">
              ✓ Assessment "{title}" created successfully! ID: {saved}
            </div>
          ) : null}

          <div className="pt-2">
            <TraceButton type="submit" disabled={!workshopId} icon="quiz">
              Create Assessment Quiz
            </TraceButton>
          </div>
        </form>
      </div>
    </OrganizerLayout>
  );
}
