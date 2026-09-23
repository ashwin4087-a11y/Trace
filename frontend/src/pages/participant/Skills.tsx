import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { TracePageLayout } from "../../components/trace/TracePageLayout";
import { TraceButton } from "../../components/trace/TraceButton";
import { TraceBadge } from "../../components/trace/TraceBadge";
import { TraceEmptyState } from "../../components/trace/TraceEmptyState";
import { TraceLoadingState } from "../../components/trace/TraceLoadingState";
import { TraceErrorState } from "../../components/trace/TraceErrorState";
import { addSkill, passport } from "../../services/skill.service";

export function SkillsPage() {
  const { language } = useApp();
  const client = useQueryClient();

  const [isAdding, setIsAdding] = useState(false);
  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState("BEGINNER");

  const query = useQuery({
    queryKey: ["skills", "me"],
    queryFn: passport,
  });

  const addSkillMutation = useMutation({
    mutationFn: () => addSkill(skillName, skillLevel),
    onSuccess: () => {
      setSkillName("");
      setIsAdding(false);
      client.invalidateQueries({ queryKey: ["skills", "me"] });
    },
  });

  const passportData = query.data;
  const skillsList = passportData?.skills ?? [];
  const certificatesList = passportData?.certificates ?? [];

  return (
    <TracePageLayout>
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-10">
        {/* Header Masthead */}
        <header className="flex flex-col gap-3 max-w-4xl">
          <div className="flex items-center gap-2 font-sans text-xs">
            <span className="w-6 h-px bg-[#BF9270]" />
            <span className="font-bold uppercase tracking-widest text-[#BF9270]">
              Verifiable Academic Ledger
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1412] font-normal leading-tight">
                {language === "TA" ? "திறன் கடவுச்சீட்டு" : "Skill Passport"}
              </h1>

              <p className="font-serif italic text-lg text-[#261D1A] mt-1">
                “Every verified skill builds your academic proof trace.”
              </p>

              <p className="font-sans text-xs sm:text-sm text-[#5F524B]">
                சரிபார்க்கப்பட்ட திறன்கள் மற்றும் சான்றிதழ்கள்.
              </p>
            </div>

            <TraceButton
              onClick={() => setIsAdding(!isAdding)}
              variant="secondary"
              size="sm"
              icon={isAdding ? "close" : "add"}
            >
              {isAdding
                ? language === "TA" ? "மூடு" : "Close"
                : language === "TA" ? "திறன் சேர்" : "Add Skill"}
            </TraceButton>
          </div>
        </header>

        {/* Add Skill Form Toggle */}
        {isAdding && (
          <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-sm max-w-xl">
            <h3 className="font-serif text-lg text-[#1A1412] font-semibold mb-3">
              Add Skill to Passport
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addSkillMutation.mutate();
              }}
              className="flex flex-col gap-4 text-xs"
            >
              <div>
                <label className="block text-[#5F524B] font-semibold mb-1">Skill Name</label>
                <input
                  type="text"
                  placeholder="e.g. Linux Kernel Hardening, Network Defense, React"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="w-full bg-[#FFEDDB]/40 border border-[#DFC1B0] rounded-lg p-2.5 text-[#1A1412] focus:outline-none focus:ring-1 focus:ring-[#BF9270]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#5F524B] font-semibold mb-1">Skill Level</label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  className="w-full bg-[#FFEDDB]/40 border border-[#DFC1B0] rounded-lg p-2.5 text-[#1A1412] focus:outline-none focus:ring-1 focus:ring-[#BF9270]"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <TraceButton type="submit" disabled={addSkillMutation.isPending}>
                  {addSkillMutation.isPending ? "Adding..." : "Save to Passport"}
                </TraceButton>
                <TraceButton type="button" variant="secondary" onClick={() => setIsAdding(false)}>
                  Cancel
                </TraceButton>
              </div>
            </form>
          </div>
        )}

        {query.isLoading && <TraceLoadingState count={2} />}
        {query.isError && (
          <TraceErrorState
            message="Unable to retrieve your Skill Passport."
            onRetry={() => query.refetch()}
          />
        )}

        {!query.isLoading && !query.isError && skillsList.length === 0 && certificatesList.length === 0 && (
          <TraceEmptyState
            icon="badge"
            title="Your Skill Passport is waiting for your first verified skill."
            description="Complete workshops or map your existing academic competencies to unlock verified credential badges."
            actionLabel="Explore Workshops"
            onAction={() => window.location.href = "/workshops"}
          />
        )}

        {/* SECTION 1: Verified Skills Grid */}
        {!query.isLoading && !query.isError && skillsList.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="border-b border-[#DFC1B0]/60 pb-3 flex items-center justify-between">
              <div>
                <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#BF9270]">
                  Academic Competencies
                </span>
                <h2 className="font-serif text-2xl text-[#1A1412] font-normal">
                  Mapped Skills ({skillsList.length})
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {skillsList.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs flex flex-col justify-between gap-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <TraceBadge variant={item.verified ? "terracotta" : "cream"}>
                      {item.verified ? "Verified" : "Self-Asserted"}
                    </TraceBadge>
                    <span className="font-sans text-xs font-bold text-[#5F524B] uppercase">
                      Level: {item.level}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-xl text-[#1A1412] font-semibold">
                      {item.skill.name}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-[#DFC1B0]/40 flex items-center justify-between text-xs text-[#5F524B]">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[#BF9270] text-[16px]">
                        verified
                      </span>
                      {item.verified ? "AUREX Verified" : "Pending Audit"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 2: Verifiable Certificates & Credentials */}
        {!query.isLoading && !query.isError && certificatesList.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="border-b border-[#DFC1B0]/60 pb-3">
              <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#BF9270]">
                Cryptographic Credentials
              </span>
              <h2 className="font-serif text-2xl text-[#1A1412] font-normal">
                Issued Certificates ({certificatesList.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificatesList.map((cert, i) => (
                <div
                  key={i}
                  className="bg-[#1A1412] border border-[#DFC1B0]/30 rounded-xl p-6 text-[#FFEDDB] shadow-sm flex flex-col justify-between gap-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#E3B7A0]">
                        Certificate Code
                      </span>
                      <p className="font-mono text-xs text-[#FFEDDB]/80 mt-0.5">
                        {cert.certificateCode}
                      </p>
                      <h3 className="font-serif text-xl font-semibold text-[#FFEDDB] mt-3">
                        {cert.workshop.title}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#BF9270] text-[#1A1412] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">
                        workspace_premium
                      </span>
                    </div>
                  </div>

                  {cert.workshop.skills && cert.workshop.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#DFC1B0]/20">
                      {cert.workshop.skills.map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-[#FFEDDB]/10 text-[#E3B7A0] text-[11px] font-sans"
                        >
                          ✓ {sk.skill.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t border-[#DFC1B0]/20 flex items-center justify-between">
                    <span className="font-sans text-xs text-[#FFEDDB]/60">
                      On-Chain Verification Ready
                    </span>
                    <Link to={`/verify/${cert.certificateCode}`}>
                      <TraceButton variant="ghost" size="sm" icon="verified">
                        Verify Certificate
                      </TraceButton>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </TracePageLayout>
  );
}
