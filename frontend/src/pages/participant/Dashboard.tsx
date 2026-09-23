import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { TracePageLayout } from "../../components/trace/TracePageLayout";
import { TraceButton } from "../../components/trace/TraceButton";
import { TraceBadge } from "../../components/trace/TraceBadge";
import { TraceProgress } from "../../components/trace/TraceProgress";
import { TraceLoadingState } from "../../components/trace/TraceLoadingState";
import { TraceErrorState } from "../../components/trace/TraceErrorState";
import { myAnalytics } from "../../services/analytics.service";
import { myPaths } from "../../services/learning-path.service";
import { passport } from "../../services/skill.service";
import { myCommunities } from "../../services/community.service";
import { api, unwrap } from "../../services/api";
import type { Workshop } from "../../types/workshop";

type RecommendationItem = {
  score: number;
  reasons: string[];
  workshop: Workshop;
};

export function ParticipantDashboardPage() {
  const { user } = useAuth();
  const { language } = useApp();

  // Real API Queries
  const analyticsQuery = useQuery({
    queryKey: ["analytics", "me"],
    queryFn: myAnalytics,
  });

  const recommendationsQuery = useQuery({
    queryKey: ["recommendations"],
    queryFn: () => unwrap<RecommendationItem[]>(api.get("/recommendations/me")),
  });

  const pathsQuery = useQuery({
    queryKey: ["learning-paths", "me"],
    queryFn: myPaths,
  });

  const skillsQuery = useQuery({
    queryKey: ["skills", "me"],
    queryFn: passport,
  });

  const communitiesQuery = useQuery({
    queryKey: ["communities", "me"],
    queryFn: myCommunities,
  });

  const isLoading =
    analyticsQuery.isLoading ||
    recommendationsQuery.isLoading ||
    pathsQuery.isLoading ||
    skillsQuery.isLoading ||
    communitiesQuery.isLoading;

  const isError =
    analyticsQuery.isError &&
    recommendationsQuery.isError &&
    pathsQuery.isError;

  const analyticsData = analyticsQuery.data as
    | {
        workshopsRegistered?: number;
        certificates?: number;
        skills?: number;
        learningPaths?: number;
        attendanceRate?: number;
        sessionsCount?: number;
      }
    | undefined;

  const featuredRec = recommendationsQuery.data?.[0];
  const activePath = pathsQuery.data?.[0];
  const skillsData = skillsQuery.data;
  const userCommunities = communitiesQuery.data ?? [];

  const firstName = user?.firstName ?? "Scholar";
  const userRole = user?.role === "PARTICIPANT" ? "Fellow Scholar" : user?.role ?? "Scholar";

  // Time-based greeting
  const hour = new Date().getHours();
  const greetingPrefix =
    hour < 12
      ? language === "TA"
        ? "காலை வணக்கம்"
        : "Good morning"
      : hour < 17
      ? language === "TA"
        ? "மதிய வணக்கம்"
        : "Good afternoon"
      : language === "TA"
      ? "மாலை வணக்கம்"
      : "Good evening";

  return (
    <TracePageLayout>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-10">
        {/* 1. Editorial Welcome Hero Header */}
        <header className="flex flex-col gap-6 relative">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DFC1B0]/70 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#BF9270] animate-pulse"></span>
              <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#BF9270]">
                AUREX SCHOLAR WORKSPACE
              </span>
            </div>
            <div className="flex items-center gap-3 font-sans text-xs text-[#5F524B]">
              <span>{userRole}</span>
              <span className="text-[#DFC1B0]">/</span>
              <span>{user?.email ?? "Registered"}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
            <div className="lg:col-span-8 flex flex-col gap-3">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1412] font-normal leading-tight tracking-tight">
                {greetingPrefix}, <span className="italic font-serif text-[#BF9270]">{firstName}.</span>
              </h1>

              {/* Bilingual Quote */}
              <div className="flex flex-col gap-1 border-l-2 border-[#BF9270] pl-4 my-2">
                <p className="font-serif italic text-lg sm:text-xl text-[#1A1412]">
                  “Continue your learning journey. Every experience leaves a trace.”
                </p>
                <p className="font-sans text-xs sm:text-sm text-[#5F524B]">
                  உங்கள் கற்றல் பயணத்தைத் தொடருங்கள். ஒவ்வொரு கற்றலும் ஒரு தடம்.
                </p>
              </div>

              <p className="font-sans text-sm sm:text-base text-[#1A1412]/80 max-w-2xl font-light">
                {language === "TA"
                  ? "பட்டறைகளைக் கண்டறியவும், சரிபார்க்கப்பட்ட திறன்களை உருவாக்கவும், உங்கள் பாடத்திட்டத்தில் முன்னேறவும்."
                  : "Discover workshops, build verified skills, stay connected and keep moving forward across your academic curriculum."}
              </p>
            </div>

            {/* Academic Ledger Side Card */}
            <div className="lg:col-span-4 flex flex-col justify-between bg-[#EDCDBB]/30 rounded-xl p-5 border border-[#DFC1B0]/60 relative overflow-hidden">
              <div className="flex flex-col gap-1">
                <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#BF9270]">
                  Academic Ledger
                </span>
                <span className="font-sans text-base font-semibold text-[#1A1412]">
                  {language === "TA" ? "செயலில் உள்ள பருவம்" : "Active Academic Trajectory"}
                </span>
                <p className="font-sans text-xs text-[#5F524B] mt-1 leading-relaxed">
                  {skillsData?.skills?.length
                    ? `${skillsData.skills.length} verified skills recorded in your Skill Passport.`
                    : "Your research logs indicate steady momentum across registered learning pathways."}
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#DFC1B0]/60 mt-4">
                <span className="font-sans text-xs text-[#5F524B]">System Status</span>
                <span className="font-sans text-xs font-semibold text-[#261D1A]">
                  Active & Synced
                </span>
              </div>
            </div>
          </div>

          {/* Key Telemetry Horizontal Banner */}
          <div className="pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-y border-[#DFC1B0]/70 py-6 bg-[#FFFFFF]/60 rounded-lg px-6 backdrop-blur-sm shadow-xs">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-3xl md:text-4xl text-[#1A1412]">
                    {analyticsData?.workshopsRegistered ?? 0}
                  </span>
                  <span className="font-sans text-[10px] uppercase tracking-wider text-[#5F524B] font-bold">
                    Workshops
                  </span>
                </div>
                <span className="font-sans text-xs text-[#5F524B] mt-0.5">
                  {language === "TA" ? "பதிவு செய்யப்பட்டவை" : "Registered sessions"}
                </span>
              </div>

              <div className="flex flex-col border-l border-[#DFC1B0]/60 pl-4">
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-3xl md:text-4xl text-[#BF9270]">
                    {analyticsData?.attendanceRate != null ? `${analyticsData.attendanceRate}%` : "100%"}
                  </span>
                </div>
                <span className="font-sans text-xs text-[#5F524B] mt-0.5">
                  {language === "TA" ? "வருகைப் பதிவு" : "Attendance record"}
                </span>
              </div>

              <div className="flex flex-col border-l border-[#DFC1B0]/60 pl-4">
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-3xl md:text-4xl text-[#1A1412]">
                    {analyticsData?.certificates ?? skillsData?.certificates?.length ?? 0}
                  </span>
                  <span className="font-sans text-[10px] uppercase tracking-wider text-[#5F524B] font-bold">
                    Assets
                  </span>
                </div>
                <span className="font-sans text-xs text-[#5F524B] mt-0.5">
                  {language === "TA" ? "சான்றிதழ்கள்" : "Verifiable credentials"}
                </span>
              </div>

              <div className="flex flex-col border-l border-[#DFC1B0]/60 pl-4">
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-3xl md:text-4xl text-[#1A1412]">
                    {analyticsData?.skills ?? skillsData?.skills?.length ?? 0}
                  </span>
                </div>
                <span className="font-sans text-xs text-[#5F524B] mt-0.5">
                  {language === "TA" ? "திறன்கள்" : "Skills mapped"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {isLoading && <TraceLoadingState count={2} />}
        {isError && <TraceErrorState message="Some dashboard analytics could not be retrieved." />}

        {/* 2. Featured Recommendation Card */}
        {featuredRec ? (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-sans text-xs">
                <span className="font-bold uppercase tracking-widest text-[#BF9270]">
                  Curricular Recommendation
                </span>
                <span className="text-[#DFC1B0]">·</span>
                <span className="text-[#5F524B]">Matched to your learning profile</span>
              </div>
              <Link
                to="/participant/recommendations"
                className="font-sans text-xs font-semibold text-[#BF9270] hover:text-[#1A1412] inline-flex items-center gap-1 transition-colors"
              >
                Browse all recommendations <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <TraceBadge variant="default">{featuredRec.workshop.domain || "Academic Track"}</TraceBadge>
                    <TraceBadge variant="cream">{featuredRec.workshop.level || "All Levels"}</TraceBadge>
                    <TraceBadge variant="cream">{featuredRec.workshop.language || "English"}</TraceBadge>
                    {featuredRec.score > 0 && (
                      <TraceBadge variant="terracotta">{featuredRec.score}% Affinity Match</TraceBadge>
                    )}
                  </div>

                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1412] font-normal leading-tight">
                      {featuredRec.workshop.title}
                    </h2>
                    <p className="font-sans text-xs text-[#5F524B] mt-1">
                      By {featuredRec.workshop.trainerName || "Faculty Lead"}
                    </p>
                  </div>

                  <p className="font-sans text-sm text-[#1A1412]/90 leading-relaxed line-clamp-2">
                    {featuredRec.workshop.description}
                  </p>

                  {/* Explainable match chips */}
                  {featuredRec.reasons && featuredRec.reasons.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-xs font-semibold text-[#5F524B]">Why it matches:</span>
                      {featuredRec.reasons.map((reason, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-xs text-[#261D1A] bg-[#EDCDBB]/50 px-2.5 py-1 rounded"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#BF9270]" />
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 flex flex-wrap items-center gap-3">
                    <Link to={`/workshops/${featuredRec.workshop.id}`}>
                      <TraceButton variant="primary" icon="arrow_forward">
                        Explore Workshop
                      </TraceButton>
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-[#1A1412] rounded-xl p-6 text-[#FFEDDB] flex flex-col justify-between min-h-[200px] border border-[#DFC1B0]/30">
                  <div className="flex flex-col gap-2">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#E3B7A0] font-bold">
                      Workshop Details
                    </span>
                    <span className="font-serif text-lg text-[#FFEDDB]">
                      {featuredRec.workshop.category || "General Studies"}
                    </span>
                    <span className="font-sans text-xs text-[#FFEDDB]/70">
                      Duration: {featuredRec.workshop.durationHours} hours
                    </span>
                  </div>
                  <div className="pt-4 border-t border-[#DFC1B0]/20 flex items-center justify-between text-xs">
                    <span className="text-[#E3B7A0]">Mode</span>
                    <span className="font-semibold">{featuredRec.workshop.mode || "Online"}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* 3. Learning Path Timeline Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#DFC1B0]/60 pb-3">
            <div>
              <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#BF9270]">
                Structured Trajectory
              </span>
              <h2 className="font-serif text-2xl text-[#1A1412] font-normal">
                {language === "TA" ? "உங்கள் கற்றல் பாதை" : "Continue Your Learning Path"}
              </h2>
            </div>
            <Link to="/participant/learning-paths">
              <TraceButton variant="secondary" size="sm" icon="north_east">
                View All Paths
              </TraceButton>
            </Link>
          </div>

          {activePath ? (
            <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <div>
                  <h3 className="font-serif text-xl text-[#1A1412] font-medium">
                    {activePath.learningPath?.title || activePath.title}
                  </h3>
                  <p className="font-sans text-xs text-[#5F524B] mt-1">
                    {activePath.learningPath?.description || activePath.description}
                  </p>
                </div>
                <div className="w-full md:w-48">
                  <TraceProgress
                    value={activePath.completedSteps ?? 0}
                    max={activePath.totalSteps || 1}
                    showPercent
                    label="Path Completion"
                  />
                </div>
              </div>

              {/* Journey Steps Preview */}
              {activePath.learningPath?.steps && activePath.learningPath.steps.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-4 border-t border-[#DFC1B0]/40">
                  {activePath.learningPath.steps.map((step, idx) => {
                    const isDone = idx < (activePath.completedSteps ?? 0);
                    return (
                      <div
                        key={step.position}
                        className={`p-3 rounded-lg border text-xs flex flex-col gap-1 ${
                          isDone
                            ? "bg-[#EDCDBB]/30 border-[#BF9270] text-[#1A1412]"
                            : "bg-[#FFFFFF] border-[#DFC1B0] text-[#5F524B]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[10px] uppercase text-[#BF9270]">
                            Step {step.position}
                          </span>
                          {isDone && (
                            <span className="material-symbols-outlined text-xs text-[#BF9270]">
                              check_circle
                            </span>
                          )}
                        </div>
                        <span className="font-medium line-clamp-1">{step.workshop?.title}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 text-center">
              <p className="font-sans text-sm text-[#5F524B]">
                {language === "TA"
                  ? "நீங்கள் இன்னும் எந்தக் கற்றல் பாதையிலும் இணையவில்லை."
                  : "You are not enrolled in any active learning path yet."}
              </p>
              <Link to="/participant/learning-paths" className="mt-3 inline-block">
                <TraceButton variant="secondary" size="sm">
                  Explore Learning Paths
                </TraceButton>
              </Link>
            </div>
          )}
        </section>

        {/* 4. Two-Column Split: Skill Passport Summary & Academic Communities */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Skill Passport Summary */}
          <section className="lg:col-span-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#BF9270]">
                Skill Passport
              </span>
              <Link
                to="/participant/skills"
                className="font-sans text-xs text-[#BF9270] hover:underline font-semibold"
              >
                View Full Passport →
              </Link>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 flex flex-col gap-4 flex-1">
              <h3 className="font-serif text-lg text-[#1A1412] font-semibold">
                Verified Credentials & Skills
              </h3>

              {skillsData?.skills && skillsData.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skillsData.skills.map((s, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-[#FFEDDB] border border-[#DFC1B0] rounded-full text-xs font-medium text-[#1A1412] flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#BF9270]" />
                      {s.skill.name} ({s.level})
                    </span>
                  ))}
                </div>
              ) : (
                <p className="font-sans text-xs text-[#5F524B]">
                  Your Skill Passport will update as you complete workshops and earn verified skills.
                </p>
              )}
            </div>
          </section>

          {/* Community Activity */}
          <section className="lg:col-span-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#BF9270]">
                Scholarly Communities
              </span>
              <Link
                to="/participant/communities"
                className="font-sans text-xs text-[#BF9270] hover:underline font-semibold"
              >
                Enter Guilds →
              </Link>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 flex flex-col gap-4 flex-1">
              <h3 className="font-serif text-lg text-[#1A1412] font-semibold">
                Enrolled Academic Guilds
              </h3>

              {userCommunities.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {userCommunities.slice(0, 3).map((comm) => (
                    <div
                      key={comm.id}
                      className="p-3 bg-[#FFEDDB]/50 rounded-lg border border-[#DFC1B0]/60 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-sans text-sm font-semibold text-[#1A1412]">
                          {comm.name}
                        </span>
                        {comm.workshop?.title && (
                          <p className="font-sans text-xs text-[#5F524B]">
                            Linked: {comm.workshop.title}
                          </p>
                        )}
                      </div>
                      <Link to="/participant/communities">
                        <span className="material-symbols-outlined text-[#BF9270] text-[20px]">
                          arrow_forward
                        </span>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-sans text-xs text-[#5F524B]">
                  Communities become available after enrollment in published workshops.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </TracePageLayout>
  );
}
