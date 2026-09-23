import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ParticipantLayout } from "../../components/layout/ParticipantLayout";
import { PathCard } from "../../components/learning-paths/PathCard";
import { Button } from "../../components/common/Button";
import { enroll, listPaths, myPaths } from "../../services/learning-path.service";

export function LearningPathsPage() {
  const client = useQueryClient();
  const catalog = useQuery({ queryKey: ["paths"], queryFn: listPaths });
  const mine = useQuery({ queryKey: ["my-paths"], queryFn: myPaths });
  const mutation = useMutation({
    mutationFn: enroll,
    onSuccess: () => client.invalidateQueries({ queryKey: ["my-paths"] }),
  });
  return (
    <ParticipantLayout title="Learning paths">
      <div className="grid gap-3">
        {catalog.data?.map((path) => (
          <div key={path.id}>
            <PathCard path={path} />
            <Button className="mt-2" variant="secondary" onClick={() => mutation.mutate(path.id)}>Enroll</Button>
          </div>
        ))}
      </div>
      <h2 className="mb-2 mt-6 font-semibold">Your progress</h2>
      {mine.data?.map((item) => (
        <PathCard key={item.id} path={item.learningPath} progress={`${item.completedSteps} of ${item.totalSteps} workshops certified`} />
      ))}
    </ParticipantLayout>
  );
}
