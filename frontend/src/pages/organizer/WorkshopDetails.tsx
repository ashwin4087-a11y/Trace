import { useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OrganizerLayout } from "../../components/layout/OrganizerLayout";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useWorkshop } from "../../hooks/useWorkshop";
import { completeWorkshop, publishWorkshop } from "../../services/workshop.service";

export function OrganizerWorkshopDetailsPage() {
  const { id = "" } = useParams();
  const query = useWorkshop(id);
  const client = useQueryClient();
  const publish = useMutation({ mutationFn: () => publishWorkshop(id), onSuccess: () => client.invalidateQueries({ queryKey: ["workshop", id] }) });
  const complete = useMutation({ mutationFn: () => completeWorkshop(id), onSuccess: () => client.invalidateQueries({ queryKey: ["workshop", id] }) });
  const workshop = query.data;
  return (
    <OrganizerLayout title={workshop?.title ?? "Workshop"}>
      {workshop ? (
        <>
          <Badge>{workshop.status}</Badge>
          <p className="mt-3 max-w-3xl text-sm">{workshop.description}</p>
          <div className="mt-4 flex gap-2">
            {workshop.status === "DRAFT" ? <Button onClick={() => publish.mutate()}>Publish</Button> : null}
            {workshop.status === "PUBLISHED" ? <Button variant="secondary" onClick={() => complete.mutate()}>Mark completed</Button> : null}
          </div>
        </>
      ) : null}
    </OrganizerLayout>
  );
}
