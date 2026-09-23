import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OrganizerLayout } from "../../components/layout/OrganizerLayout";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useWorkshopList } from "../../hooks/useWorkshop";
import { publishWorkshop } from "../../services/workshop.service";

export function OrganizerWorkshopsPage() {
  const query = useWorkshopList();
  const client = useQueryClient();
  const publish = useMutation({
    mutationFn: publishWorkshop,
    onSuccess: () => client.invalidateQueries({ queryKey: ["workshops"] }),
  });
  return (
    <OrganizerLayout title="Workshops">
      <ul className="space-y-3">
        {query.data?.map((workshop) => (
          <li key={workshop.id} className="rounded border border-line bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Link className="font-semibold" to={`/organizer/workshops/${workshop.id}`}>{workshop.title}</Link>
                <div className="mt-1"><Badge>{workshop.status}</Badge></div>
              </div>
              <div className="flex gap-2">
                <Link to={`/organizer/workshops/${workshop.id}/edit`}><Button variant="secondary">Edit</Button></Link>
                {workshop.status === "DRAFT" ? <Button onClick={() => publish.mutate(workshop.id)}>Publish</Button> : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </OrganizerLayout>
  );
}
