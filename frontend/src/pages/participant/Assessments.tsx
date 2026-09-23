import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ParticipantLayout } from "../../components/layout/ParticipantLayout";
import { QuestionList } from "../../components/assessments/QuestionList";
import { Loader } from "../../components/common/Loader";
import { TraceBadge } from "../../components/trace/TraceBadge";
import { TraceButton } from "../../components/trace/TraceButton";
import { useRegistration } from "../../hooks/useRegistration";
import { listAssessments, submitAssessment } from "../../services/assessment.service";

export function AssessmentsPage() {
  const registrations = useRegistration();
  const confirmedReg = registrations.data?.find((item) => item.status === "CONFIRMED") || registrations.data?.[0];
  const workshopId = confirmedReg?.workshopId;

  const query = useQuery({
    queryKey: ["assessments", workshopId],
    queryFn: () => listAssessments(workshopId!),
    enabled: Boolean(workshopId),
  });

  const [result, setResult] = useState("");
  const [submittingId, setSubmittingId] = useState("");

  return (
    <ParticipantLayout title="Course Assessments & Quizzes">
      <div className="flex flex-col gap-6">
        <p className="font-sans text-xs text-[#5F524B]">
          Complete knowledge evaluations and quizzes assigned to your enrolled workshops to validate your mastery.
        </p>

        {query.isLoading ? <Loader /> : null}

        {!workshopId ? (
          <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 text-center text-xs text-[#5F524B]">
            Confirmed workshop enrollment is required to view assigned assessments.
          </div>
        ) : null}

        {query.data && query.data.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 text-center text-xs text-[#5F524B]">
            No assessments currently assigned for this workshop.
          </div>
        ) : null}

        {query.data?.map((assessment) => (
          <section
            key={assessment.id}
            className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs flex flex-col gap-5"
          >
            <div className="border-b border-[#DFC1B0]/60 pb-3 flex items-center justify-between">
              <h2 className="font-serif text-xl font-semibold text-[#1A1412]">{assessment.title}</h2>
              <TraceBadge variant="cream">{assessment.questions?.length ?? 0} Questions</TraceBadge>
            </div>

            <QuestionList questions={assessment.questions} />

            <div className="pt-3 border-t border-[#DFC1B0]/40 flex flex-wrap items-center justify-between gap-3">
              <TraceButton
                disabled={submittingId === assessment.id}
                onClick={async () => {
                  setSubmittingId(assessment.id);
                  try {
                    const scored = await submitAssessment(assessment.id, assessment.questions.map(() => 0));
                    setResult(`${assessment.title}: ${scored.score} / ${scored.maxScore} points`);
                  } finally {
                    setSubmittingId("");
                  }
                }}
                icon="fact_check"
              >
                {submittingId === assessment.id ? "Evaluating..." : "Submit Assessment Answers"}
              </TraceButton>

              {result ? (
                <div className="p-2.5 bg-[#FFEDDB] border border-[#BF9270] rounded-lg text-xs font-semibold text-[#1A1412]">
                  Result: {result}
                </div>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </ParticipantLayout>
  );
}
