import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { TracePageLayout } from "../../components/trace/TracePageLayout";
import { TraceButton } from "../../components/trace/TraceButton";
import { TraceBadge } from "../../components/trace/TraceBadge";
import { TraceEmptyState } from "../../components/trace/TraceEmptyState";
import { TraceLoadingState } from "../../components/trace/TraceLoadingState";
import { TraceErrorState } from "../../components/trace/TraceErrorState";
import { api, unwrap } from "../../services/api";
import type { Workshop } from "../../types/workshop";

type RecommendationItem = {
  score: number;
  reasons: string[];
  workshop: Workshop;
};

export function RecommendationsPage() {
  const { language } = useApp();

  const query = useQuery({
    queryKey: ["recommendations"],
    queryFn: () => unwrap<RecommendationItem[]>(api.get("/recommendations/me")),
  });

  const recommendations = query.data ?? [];
  const featuredMatch = recommendations[0];
  const otherMatches = recommendations.slice(1);

  return (
    <TracePageLayout>
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-10">
        {/* Top Editorial Header & Human Scoring Thesis */}
        <header className="max-w-4xl flex flex-col gap-3">
          <div className="flex items-center gap-2 font-sans text-xs">
            <span className="w-6 h-px bg-[#BF9270]" />
            <span className="font-bold uppercase tracking-widest text-[#BF9270]">
              Curated Academic Registry
            </span>
            <span className="text-[#5F524B]">· Rule-Based System</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1412] font-normal leading-tight">
            {language === "TA" ? "உங்களுக்கான பரிந்துரைகள்" : "Recommended for you"}
          </h1>

          <p className="font-serif italic text-lg text-[#261D1A]">
            “Learning opportunities selected around your interests, verified skills, and lifelong journey.”
          </p>

          <p className="font-sans text-xs sm:text-sm text-[#5F524B]">
            உங்கள் ஆர்வங்கள் மற்றும் திறன்களுக்கு ஏற்ப வடிவமைக்கப்பட்ட பரிந்துரைகள்.
          </p>

          {/* Human Scoring Explanation Box */}
          <div className="relative pl-4 py-3 border-l-2 border-[#BF9270] bg-[#EDCDBB]/25 rounded-r-lg max-w-2xl mt-2">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#BF9270] text-[20px] shrink-0 mt-0.5">
                verified_user
              </span>
              <div>
                <p className="font-sans text-xs font-bold text-[#1A1412] uppercase tracking-wider mb-0.5">
                  Human-Centered Match Thesis
                </p>
                <p className="font-sans text-xs text-[#5F524B] leading-relaxed">
                  Recommendations are calculated transparently using domain, department, skills, interests, and bilingual preferences. Every match provides an explicit explanation trace.
                </p>
              </div>
            </div>
          </div>
        </header>

        {query.isLoading && <TraceLoadingState count={3} />}
        {query.isError && (
          <TraceErrorState
            message="Unable to fetch recommendations at this time."
            onRetry={() => query.refetch()}
          />
        )}

        {!query.isLoading && !query.isError && recommendations.length === 0 && (
          <TraceEmptyState
            icon="psychology"
            title="Your learning recommendations are taking shape."
            description="As you register for workshops and map skills to your passport, personalized recommendations will appear here."
            actionLabel="Explore All Workshops"
            onAction={() => window.location.href = "/workshops"}
          />
        )}

        {/* SECTION 1: Featured Top Match */}
        {featuredMatch && (
          <section className="flex flex-col gap-4">
            <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 md:p-8 shadow-sm relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-[#DFC1B0]">
                <div className="flex items-center gap-2">
                  <TraceBadge variant="terracotta">Featured Match</TraceBadge>
                  {featuredMatch.score > 0 && (
                    <span className="font-sans text-xs font-bold text-[#BF9270] ml-2">
                      {featuredMatch.score}% AFFINITY
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-[#5F524B] font-sans">
                  <span>Category: {featuredMatch.workshop.category || "General"}</span>
                  <span>·</span>
                  <span>Language: {featuredMatch.workshop.language || "EN"}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-xs uppercase tracking-wider text-[#5F524B]">
                      {featuredMatch.workshop.domain || "Academic Track"}
                    </span>
                    <span className="text-[#5F524B]">/</span>
                    <span className="font-sans text-xs text-[#5F524B]">
                      {featuredMatch.workshop.level || "All Levels"}
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1412] font-normal leading-tight">
                    {featuredMatch.workshop.title}
                  </h2>

                  <p className="font-sans text-sm text-[#1A1412]/90 leading-relaxed">
                    {featuredMatch.workshop.description}
                  </p>

                  {/* Reasons list */}
                  {featuredMatch.reasons && featuredMatch.reasons.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <p className="font-sans text-xs font-bold text-[#1A1412] uppercase tracking-wider">
                        Match Justifications
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#261D1A]">
                        {featuredMatch.reasons.map((r, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#BF9270] text-[16px]">
                              check_circle
                            </span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex flex-wrap items-center gap-3">
                    <Link to={`/workshops/${featuredMatch.workshop.id}`}>
                      <TraceButton variant="primary" icon="arrow_forward">
                        View Workshop & Syllabus
                      </TraceButton>
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-[#1A1412] rounded-xl p-6 text-[#FFEDDB] flex flex-col justify-between border border-[#DFC1B0]/30">
                  <div className="flex flex-col gap-3">
                    <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#E3B7A0]">
                      Trainer & Details
                    </span>
                    <span className="font-serif text-lg font-semibold text-[#FFEDDB]">
                      {featuredMatch.workshop.trainerName || "Faculty Lead"}
                    </span>
                    <div className="space-y-1 text-xs text-[#FFEDDB]/70 pt-2 border-t border-[#DFC1B0]/20">
                      <div>Mode: <strong className="text-[#FFEDDB]">{featuredMatch.workshop.mode || "Online"}</strong></div>
                      <div>Duration: <strong className="text-[#FFEDDB]">{featuredMatch.workshop.durationHours} hrs</strong></div>
                      <div>Deadline: <strong className="text-[#FFEDDB]">{featuredMatch.workshop.registrationDeadline || "N/A"}</strong></div>
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-[#DFC1B0]/20 text-xs text-[#E3B7A0]">
                    Verified Syllabus Accreditation
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 2: Additional Recommendations Grid */}
        {otherMatches.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="border-b border-[#DFC1B0]/60 pb-3">
              <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#BF9270]">
                Additional Curricular Matches
              </span>
              <h2 className="font-serif text-2xl text-[#1A1412] font-normal">
                Build On What You Know
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherMatches.map((item) => (
                <article
                  key={item.workshop.id}
                  className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#DFC1B0]/60">
                      <span className="font-sans text-xs font-semibold text-[#BF9270]">
                        {item.score > 0 ? `${item.score}% Match Affinity` : "Recommended"}
                      </span>
                      <TraceBadge variant="cream">{item.workshop.domain || "General"}</TraceBadge>
                    </div>

                    <h3 className="font-serif text-xl text-[#1A1412] font-medium mb-2">
                      {item.workshop.title}
                    </h3>

                    <p className="font-sans text-xs text-[#5F524B] line-clamp-2 mb-4 leading-relaxed">
                      {item.workshop.description}
                    </p>

                    {item.reasons && item.reasons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {item.reasons.map((r, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-sans text-[#261D1A] bg-[#EDCDBB]/40 px-2 py-0.5 rounded"
                          >
                            • {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#DFC1B0]/40 flex items-center justify-between">
                    <span className="font-sans text-xs text-[#5F524B]">
                      {item.workshop.durationHours} hrs · {item.workshop.language || "EN"}
                    </span>
                    <Link to={`/workshops/${item.workshop.id}`}>
                      <TraceButton variant="secondary" size="sm" icon="arrow_forward">
                        View
                      </TraceButton>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </TracePageLayout>
  );
}
