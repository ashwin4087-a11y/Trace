import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { TracePageLayout } from "../../components/trace/TracePageLayout";
import { TraceButton } from "../../components/trace/TraceButton";
import { TraceBadge } from "../../components/trace/TraceBadge";
import { TraceProgress } from "../../components/trace/TraceProgress";
import { TraceEmptyState } from "../../components/trace/TraceEmptyState";
import { TraceLoadingState } from "../../components/trace/TraceLoadingState";
import { TraceErrorState } from "../../components/trace/TraceErrorState";
import { enroll, listPaths, myPaths } from "../../services/learning-path.service";
import type { LearningPath } from "../../types/learning-path";

type MyPathItem = LearningPath & {
  completedSteps: number;
  totalSteps: number;
  learningPath: LearningPath;
};

export function LearningPathsPage() {
  const { language } = useApp();
  const client = useQueryClient();

  const myPathsQuery = useQuery({
    queryKey: ["learning-paths", "me"],
    queryFn: myPaths,
  });

  const allPathsQuery = useQuery({
    queryKey: ["learning-paths", "all"],
    queryFn: listPaths,
  });

  const enrollMutation = useMutation({
    mutationFn: (id: string) => enroll(id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["learning-paths"] });
    },
  });

  const enrolledPaths: MyPathItem[] = myPathsQuery.data ?? [];
  const allPaths: LearningPath[] = allPathsQuery.data ?? [];

  const enrolledPathIds = new Set(
    enrolledPaths.map((p) => p.learningPath?.id || p.id)
  );

  const isLoading = myPathsQuery.isLoading || allPathsQuery.isLoading;
  const isError = myPathsQuery.isError && allPathsQuery.isError;

  return (
    <TracePageLayout>
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-10">
        {/* Header Masthead */}
        <header className="flex flex-col gap-3 max-w-4xl">
          <div className="flex items-center gap-2 font-sans text-xs">
            <span className="w-6 h-px bg-[#BF9270]" />
            <span className="font-bold uppercase tracking-widest text-[#BF9270]">
              Curricular Trajectories
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1412] font-normal leading-tight">
            {language === "TA" ? "கற்றல் பாதைகள்" : "Learning Paths"}
          </h1>

          <p className="font-serif italic text-lg text-[#261D1A]">
            “Your learning journey starts here.”
          </p>

          <p className="font-sans text-xs sm:text-sm text-[#5F524B]">
            தொழில்நுட்பம் மற்றும் அறிவியல் துறைகளில் கட்டமைக்கப்பட்ட கற்றல் பயணங்கள்.
          </p>
        </header>

        {isLoading && <TraceLoadingState count={3} />}
        {isError && (
          <TraceErrorState
            message="Unable to load learning paths."
            onRetry={() => {
              myPathsQuery.refetch();
              allPathsQuery.refetch();
            }}
          />
        )}

        {/* SECTION 1: My Enrolled Learning Paths */}
        {!isLoading && !isError && (
          <section className="flex flex-col gap-6">
            <div className="border-b border-[#DFC1B0]/60 pb-3">
              <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#BF9270]">
                Active Enrolments
              </span>
              <h2 className="font-serif text-2xl text-[#1A1412] font-normal">
                My Enrolled Journeys ({enrolledPaths.length})
              </h2>
            </div>

            {enrolledPaths.length === 0 ? (
              <TraceEmptyState
                icon="route"
                title={language === "TA" ? "உங்கள் கற்றல் பயணம் இங்கே தொடங்குகிறது." : "Your learning journey starts here."}
                description="Explore available trajectories below and enroll to track your progress step-by-step."
              />
            ) : (
              <div className="space-y-6">
                {enrolledPaths.map((item) => {
                  const targetPath = item.learningPath || item;
                  const total = item.totalSteps || targetPath.steps?.length || 1;
                  const completed = item.completedSteps ?? 0;
                  const isFinished = completed >= total && total > 0;
                  const currentStepObj = targetPath.steps?.[completed];

                  return (
                    <article
                      key={item.id}
                      className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 md:p-8 shadow-sm flex flex-col gap-6"
                    >
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-4 border-b border-[#DFC1B0]">
                        <div>
                          <div className="flex items-center gap-2">
                            <TraceBadge variant={isFinished ? "terracotta" : "default"}>
                              {isFinished ? "Completed Path" : "In Progress"}
                            </TraceBadge>
                            {targetPath.domain && (
                              <TraceBadge variant="cream">{targetPath.domain}</TraceBadge>
                            )}
                          </div>
                          <h3 className="font-serif text-2xl text-[#1A1412] font-semibold mt-2">
                            {targetPath.title}
                          </h3>
                          <p className="font-sans text-xs text-[#5F524B] mt-1">
                            {targetPath.description}
                          </p>
                        </div>

                        <div className="w-full md:w-56 flex flex-col gap-1">
                          <TraceProgress
                            value={completed}
                            max={total}
                            showPercent
                            label={`${completed} of ${total} steps completed`}
                          />
                        </div>
                      </div>

                      {/* Timeline Visual Journey */}
                      {targetPath.steps && targetPath.steps.length > 0 ? (
                        <div className="flex flex-col gap-3">
                          <span className="font-sans text-xs font-bold text-[#5F524B] uppercase tracking-wider">
                            Curricular Sequence
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            {targetPath.steps.map((st, idx) => {
                              const stepDone = idx < completed;
                              const isCurrent = idx === completed;

                              return (
                                <div
                                  key={st.position}
                                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3 text-xs transition-all ${
                                    stepDone
                                      ? "bg-[#EDCDBB]/30 border-[#BF9270] text-[#1A1412]"
                                      : isCurrent
                                      ? "bg-[#FFEDDB] border-[#BF9270] ring-1 ring-[#BF9270] shadow-xs text-[#1A1412]"
                                      : "bg-[#FFFFFF] border-[#DFC1B0] text-[#5F524B]"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-[11px] uppercase tracking-wider text-[#BF9270]">
                                      Step {st.position}
                                    </span>
                                    {stepDone ? (
                                      <span className="material-symbols-outlined text-[18px] text-[#BF9270]">
                                        check_circle
                                      </span>
                                    ) : isCurrent ? (
                                      <span className="px-2 py-0.5 rounded bg-[#BF9270] text-[#FFEDDB] font-bold text-[10px]">
                                        Current
                                      </span>
                                    ) : null}
                                  </div>

                                  <div>
                                    <h4 className="font-semibold text-sm line-clamp-2">
                                      {st.workshop?.title}
                                    </h4>
                                  </div>

                                  {st.workshop?.id && (
                                    <Link
                                      to={`/workshops/${st.workshop.id}`}
                                      className="font-sans text-xs font-semibold text-[#BF9270] hover:underline mt-auto"
                                    >
                                      View Workshop →
                                    </Link>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}

                      {/* Current Step Summary */}
                      {currentStepObj && (
                        <div className="p-4 rounded-lg bg-[#FFEDDB]/40 border border-[#DFC1B0]/60 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#BF9270] text-[24px]">
                              play_circle
                            </span>
                            <div>
                              <span className="font-sans text-xs text-[#5F524B] uppercase font-bold">
                                Next Immediate Milestone
                              </span>
                              <p className="font-sans text-sm font-semibold text-[#1A1412]">
                                Step {currentStepObj.position}: {currentStepObj.workshop?.title}
                              </p>
                            </div>
                          </div>
                          {currentStepObj.workshop?.id && (
                            <Link to={`/workshops/${currentStepObj.workshop.id}`}>
                              <TraceButton size="sm" icon="arrow_forward">
                                Resume Session
                              </TraceButton>
                            </Link>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* SECTION 2: Discover All Available Learning Paths */}
        {!isLoading && !isError && (
          <section className="flex flex-col gap-6">
            <div className="border-b border-[#DFC1B0]/60 pb-3">
              <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#BF9270]">
                Catalogue Registry
              </span>
              <h2 className="font-serif text-2xl text-[#1A1412] font-normal">
                Discover All Paths ({allPaths.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allPaths.map((path) => {
                const isEnrolled = enrolledPathIds.has(path.id);

                return (
                  <article
                    key={path.id}
                    className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#DFC1B0]/60">
                        <TraceBadge variant={isEnrolled ? "terracotta" : "cream"}>
                          {isEnrolled ? "Enrolled" : path.domain || "General Track"}
                        </TraceBadge>
                        <span className="font-sans text-xs text-[#5F524B]">
                          {path.steps?.length ?? 0} Workshop Steps
                        </span>
                      </div>

                      <h3 className="font-serif text-xl text-[#1A1412] font-semibold mb-2">
                        {path.title}
                      </h3>

                      <p className="font-sans text-xs sm:text-sm text-[#5F524B] mb-4 leading-relaxed">
                        {path.description}
                      </p>

                      {/* Sequence List Preview */}
                      {path.steps && path.steps.length > 0 && (
                        <div className="space-y-1.5 mb-6 bg-[#FFEDDB]/40 p-3 rounded-lg border border-[#DFC1B0]/40">
                          <span className="font-sans text-[11px] uppercase tracking-wider text-[#BF9270] font-bold block mb-1">
                            Curriculum Sequence:
                          </span>
                          {path.steps.map((st) => (
                            <div key={st.position} className="font-sans text-xs text-[#1A1412] flex items-center gap-2">
                              <span className="font-bold text-[#BF9270]">{st.position}.</span>
                              <span className="truncate">{st.workshop?.title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#DFC1B0]/40 flex items-center justify-between">
                      {isEnrolled ? (
                        <span className="font-sans text-xs font-semibold text-[#BF9270] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          Enrolled
                        </span>
                      ) : (
                        <TraceButton
                          size="sm"
                          disabled={enrollMutation.isPending}
                          onClick={() => enrollMutation.mutate(path.id)}
                          icon="add_circle"
                        >
                          Enroll in Path
                        </TraceButton>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </TracePageLayout>
  );
}
