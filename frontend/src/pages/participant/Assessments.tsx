import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ParticipantLayout } from "../../components/layout/ParticipantLayout";
import { QuestionList } from "../../components/assessments/QuestionList";
import { Button } from "../../components/common/Button";
import { useRegistration } from "../../hooks/useRegistration";
import { listAssessments, submitAssessment } from "../../services/assessment.service";

export function AssessmentsPage() {
  const registrations = useRegistration();
  const workshopId = registrations.data?.find((item) => item.status === "CONFIRMED")?.workshopId;
  const query = useQuery({ queryKey: ["assessments", workshopId], queryFn: () => listAssessments(workshopId!), enabled: Boolean(workshopId) });
  const [result, setResult] = useState("");
  return (
    <ParticipantLayout title="Assessments">
      {query.data?.map((assessment) => (
        <section key={assessment.id} className="mb-6">
          <h2 className="font-semibold">{assessment.title}</h2>
          <QuestionList questions={assessment.questions} />
          <Button
            className="mt-3"
            onClick={async () => {
              const scored = await submitAssessment(assessment.id, assessment.questions.map(() => 0));
              setResult(`${assessment.title}: ${scored.score}/${scored.maxScore}`);
            }}
          >
            Submit first option for each question
          </Button>
        </section>
      ))}
      {result ? <p className="text-sm">{result}</p> : null}
      {!workshopId ? <p className="text-sm">Confirmed registration is required.</p> : null}
    </ParticipantLayout>
  );
}
