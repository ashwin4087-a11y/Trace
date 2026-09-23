import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "../../components/layout/MainLayout";
import { useApp } from "../../context/AppContext";
import { listWorkshops } from "../../services/workshop.service";
import { WorkshopCard } from "../../components/workshops/WorkshopCard";

export function HomePage() {
  const { t, language } = useApp();
  const workshops = useQuery({ queryKey: ["workshops", "home"], queryFn: () => listWorkshops({ pageSize: 3 }) });

  return (
    <MainLayout>
      <div className="flex flex-col gap-10">
        {/* Editorial Welcome Hero */}
        <section className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-lg p-6 md:p-10 shadow-xs relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DFC1B0]/70 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#BF9270]"></span>
              <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#BF9270]">
                AUREX 2026 ACADEMIC DISCOVERY
              </span>
            </div>
            <div className="flex items-center gap-3 font-sans text-xs text-[#5F524B]">
              <span>Lifelong Learning Ecosystem</span>
              <span className="text-[#DFC1B0]">/</span>
              <span>Open Catalog</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 flex flex-col gap-4">
              <h1 className="font-serif text-3xl md:text-5xl font-normal text-[#1A1412] leading-tight tracking-tight">
                Every learning experience <span className="italic font-serif text-[#BF9270]">leaves a trace.</span>
              </h1>
              <div className="flex flex-col gap-1.5 border-l-2 border-[#BF9270] pl-4 my-2">
                <p className="font-serif text-lg italic text-[#1A1412]">
                  “Continue your learning journey. Discover workshops, earn verified credentials, and map your academic growth.”
                </p>
                <p className="font-sans text-sm text-[#5F524B]">
                  ஒவ்வொரு கற்றல் அனுபவமும் ஒரு சுவட்டை விட்டுச்செல்கிறது.
                </p>
              </div>
              <p className="font-sans text-base text-[#1A1412]/85 max-w-2xl font-light">
                {t("tagline") || "Explore accredited workshops, build your verified skill passport, and participate in academic communities across the curriculum."}
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/workshops"
                  className="px-6 py-2.5 rounded-lg bg-[#BF9270] text-[#FFEDDB] text-sm font-semibold hover:opacity-90 transition-colors shadow-xs"
                >
                  Browse Workshops
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 rounded-lg bg-[#FFFFFF] border border-[#DFC1B0] text-[#1A1412] text-sm font-semibold hover:bg-[#FFEDDB] transition-colors"
                >
                  Join as Scholar
                </Link>
              </div>
            </div>

            {/* Marginalia / Ledger Overview */}
            <div className="lg:col-span-4 bg-[#FFEDDB]/60 border border-[#DFC1B0] rounded-lg p-5 flex flex-col justify-between gap-4">
              <div>
                <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#BF9270]">
                  Academic Directory
                </span>
                <h3 className="font-serif text-xl font-medium text-[#1A1412] mt-1">
                  Verifiable Credentials
                </h3>
                <p className="font-sans text-xs text-[#5F524B] mt-2 leading-relaxed">
                  Participate in live sessions, achieve at least 90% attendance, and receive cryptographically verified certificates deposited directly into your passport.
                </p>
              </div>
              <div className="pt-3 border-t border-[#DFC1B0]/60 flex items-center justify-between text-xs font-sans">
                <span className="text-[#5F524B]">Verification Protocol</span>
                <span className="text-[#261D1A] font-semibold">DID:AUREX-TRACE-2026</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Core Value Pillars */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-lg p-6 flex flex-col gap-2">
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">For Scholars</span>
            <h3 className="font-serif text-xl font-medium text-[#1A1412]">Participate & Build Skills</h3>
            <p className="font-sans text-sm text-[#5F524B]">Register for interactive workshops, attend live sessions, and maintain a self-sovereign skill passport.</p>
          </div>
          <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-lg p-6 flex flex-col gap-2">
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">For Educators</span>
            <h3 className="font-serif text-xl font-medium text-[#1A1412]">Publish & Conduct Sessions</h3>
            <p className="font-sans text-sm text-[#5F524B]">Organize workshops, record session attendance, manage learning materials, and issue verified certificates.</p>
          </div>
          <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-lg p-6 flex flex-col gap-2">
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">For Institutions</span>
            <h3 className="font-serif text-xl font-medium text-[#1A1412]">Governance & Oversight</h3>
            <p className="font-sans text-sm text-[#5F524B]">Manage department catalogs, monitor platform analytics, oversee user roles, and audit compliance logs.</p>
          </div>
        </div>

        {/* Open Workshops Catalog Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl md:text-3xl text-[#1A1412] font-normal">
              {language === "TA" ? "திறந்த பட்டறைகள்" : "Open Workshops"}
            </h2>
            <Link to="/workshops" className="font-sans text-xs font-semibold text-[#BF9270] hover:underline">
              View All Workshops &rarr;
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {workshops.data?.map((workshop) => (
              <WorkshopCard key={workshop.id} workshop={workshop} />
            ))}
            {workshops.isError ? (
              <div className="col-span-3 bg-[#FFFFFF] border border-[#DFC1B0] rounded-lg p-6 text-center text-sm text-[#5F524B]">
                Workshop catalog is currently loading or offline. Connect backend service to view live workshops.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
