import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { OrganizerLayout } from "../../components/layout/OrganizerLayout";
import { Button } from "../../components/common/Button";
import { ErrorState } from "../../components/common/ErrorState";
import { Input } from "../../components/common/Input";
import { Textarea } from "../../components/common/Textarea";
import { useWorkshop } from "../../hooks/useWorkshop";
import { errorText } from "../../lib/errors";
import { updateWorkshop } from "../../services/workshop.service";

export function EditWorkshopPage() {
  const { id = "" } = useParams();
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
    <OrganizerLayout title="Edit workshop">
      <form
        className="grid max-w-2xl gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          try {
            await updateWorkshop(id, { title, description });
            setMessage("Saved.");
          } catch (caught) {
            setError(errorText(caught));
          }
        }}
      >
        <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} required />
        <Textarea label="Description" value={description} onChange={(event) => setDescription(event.target.value)} required />
        {error ? <ErrorState message={error} /> : null}
        {message ? <p className="text-sm">{message}</p> : null}
        <Button type="submit">Save</Button>
      </form>
    </OrganizerLayout>
  );
}
