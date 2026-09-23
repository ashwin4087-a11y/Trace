import { MainLayout } from "../../components/layout/MainLayout";

export function AboutPage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-lg p-8 md:p-10 shadow-xs flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#BF9270]">
              Academic Architecture & Mandate
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-normal text-[#1A1412]">
              About TRACE Academia
            </h1>
          </div>

          <div className="flex flex-col gap-4 border-l-2 border-[#BF9270] pl-6 my-2">
            <p className="font-serif text-xl italic text-[#1A1412]">
              “Every learning experience leaves a trace.”
            </p>
            <p className="font-sans text-sm text-[#5F524B]">
              ஒவ்வொரு கற்றல் அனுபவமும் ஒரு சுவட்டை விட்டுச்செல்கிறது.
            </p>
          </div>

          <div className="font-sans text-base text-[#1A1412]/85 leading-relaxed flex flex-col gap-4">
            <p>
              TRACE Academia (AUREX 2026 Ecosystem) crafts an intentional, scholarly, and human-centered digital landscape for lifelong learning. Designed for scholars, educators, and institutional administrators, the platform emphasizes quiet academic focus, intellectual authority, and verifiable achievement.
            </p>
            <p>
              Organizers publish accredited workshops and structure session milestones. Scholars participate in interactive learning modules, track attendance in real time, build verified skill passports, and join bilingual academic communities.
            </p>
            <p>
              All certificates issued across the TRACE ecosystem enforce server-side attendance thresholds (90% minimum threshold) and are cryptographically verified through decentralized identifier records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#DFC1B0]/60">
            <div className="flex flex-col gap-1">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">Protocol</span>
              <span className="font-serif text-lg text-[#1A1412]">AUREX-TRACE-2026</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">Languages</span>
              <span className="font-serif text-lg text-[#1A1412]">English & Tamil (தமிழ்)</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">Verification</span>
              <span className="font-serif text-lg text-[#1A1412]">Cryptographic Passport</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
