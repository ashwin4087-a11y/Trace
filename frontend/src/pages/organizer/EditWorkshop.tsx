import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { OrganizerLayout } from "../../components/layout/OrganizerLayout";
import { ErrorState } from "../../components/common/ErrorState";
import { Input } from "../../components/common/Input";
import { Textarea } from "../../components/common/Textarea";
import { TraceButton } from "../../components/trace/TraceButton";
import { useWorkshop } from "../../hooks/useWorkshop";
import { errorText } from "../../lib/errors";
import { updateWorkshop } from "../../services/workshop.service";

export function EditWorkshopPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const query = useWorkshop(id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (query.data) {
      setTitle(query.data.title);
      setDescription(query.data.description);
    }
  }, [query.data]);

  return (
    <OrganizerLayout title="Edit Workshop Curriculum">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <form
          className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-8 shadow-xs flex flex-col gap-5"
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            setMessage("");
            try {
              await updateWorkshop(id, { title, description });
              setMessage("Workshop details updated successfully!");
            } catch (caught) {
              setError(errorText(caught));
            }
          }}
        >
          <div className="border-b border-[#DFC1B0]/60 pb-4">
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">
              Curriculum Editing
            </span>
            <h3 className="font-serif text-2xl text-[#1A1412] font-semibold mt-0.5">
              Update Workshop Metadata
            </h3>
          </div>

          <Input label="Workshop Title" value={title} onChange={(event) => setTitle(event.target.value)} required />
          <Textarea label="Curriculum Description" value={description} onChange={(event) => setDescription(event.target.value)} required />

          {error ? <ErrorState message={error} /> : null}
          {message ? (
            <div className="p-3 bg-[#FFEDDB] border border-[#BF9270] rounded-lg text-xs font-semibold text-[#1A1412] text-center">
              ✓ {message}
            </div>
          ) : null}

          <div className="pt-3 border-t border-[#DFC1B0]/60 flex items-center justify-end gap-3">
            <TraceButton type="button" variant="secondary" onClick={() => navigate(`/organizer/workshops/${id}`)}>
              Back to Details
            </TraceButton>
            <TraceButton type="submit" icon="save">
              Save Changes
            </TraceButton>
          </div>
        </form>
      </div>
    </OrganizerLayout>
  );
}
