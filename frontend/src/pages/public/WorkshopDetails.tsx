import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { MainLayout } from "../../components/layout/MainLayout";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { ErrorState } from "../../components/common/ErrorState";
import { Loader } from "../../components/common/Loader";
import { useAuth } from "../../context/AuthContext";
import { errorText } from "../../lib/errors";
import { register } from "../../services/registration.service";
import { getWorkshop } from "../../services/workshop.service";

export function WorkshopDetailsPage() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["workshop", id], queryFn: () => getWorkshop(id), enabled: Boolean(id) });
  const mutation = useMutation({
    mutationFn: () => register(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ["my-registrations"] }),
  });
  const workshop = query.data;
  return (
    <MainLayout>
      {query.isLoading ? <Loader /> : null}
      {query.isError ? <ErrorState message={errorText(query.error)} /> : null}
      {workshop ? (
        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <article>
            <div className="mb-3 flex gap-2">
              <Badge>{workshop.status}</Badge>
              <Badge tone="good">{workshop.mode}</Badge>
            </div>
            <h1 className="text-3xl font-bold">{workshop.title}</h1>
            <p className="mt-4 whitespace-pre-wrap text-ink/80">{workshop.description}</p>
            <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="font-semibold">Trainer</dt><dd>{workshop.trainerName}</dd></div>
              <div><dt className="font-semibold">Level</dt><dd>{workshop.level}</dd></div>
              <div><dt className="font-semibold">Language</dt><dd>{workshop.language}</dd></div>
              <div><dt className="font-semibold">Capacity</dt><dd>{workshop.capacity}</dd></div>
            </dl>
          </article>
          <Card title="Registration">
            <p className="mb-3 text-sm">{workshop.priceCents === 0 ? "This workshop is free." : "Paid workshops create an order. Card numbers are never stored."}</p>
            {user?.role === "PARTICIPANT" ? (
              <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>Register</Button>
            ) : (
              <p className="text-sm">Log in as a participant to register.</p>
            )}
            {mutation.isError ? <ErrorState message={errorText(mutation.error)} /> : null}
            {mutation.isSuccess ? <p className="mt-2 text-sm">Status: {mutation.data.status}</p> : null}
            {workshop.meetingUrl ? <p className="mt-3 text-sm">Meeting link is shown after you are confirmed.</p> : null}
          </Card>
        </div>
      ) : null}
    </MainLayout>
  );
}
