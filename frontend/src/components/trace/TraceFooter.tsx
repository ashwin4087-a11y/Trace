import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { TraceLogoMark } from "./TraceLogo";

export function TraceFooter() {
  const { language, setLanguage } = useApp();

  return (
    <footer className="w-full bg-[#1A1412] text-[#FFEDDB] border-t border-[#261D1A] mt-auto">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-[#261D1A]/80">
          {/* Brand & Editorial Tagline */}
          <div className="md:col-span-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#FFEDDB] p-1.5 rounded-lg flex items-center justify-center">
                <TraceLogoMark className="h-7 w-7" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-semibold text-[#FFEDDB] tracking-tight">TRACE</span>
                <span className="h-4 w-px bg-[#DFC1B0]/40"></span>
                <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#E3B7A0]">Academia</span>
              </div>
            </div>
            <p className="font-serif italic text-lg text-[#FFEDDB]/90 max-w-md">
              “Every learning experience leaves a trace.”
            </p>
            <p className="font-sans text-xs text-[#FFEDDB]/70 max-w-md font-light">
              ஒவ்வொரு கற்றல் அனுபவமும் ஒரு சுவட்டை விட்டுச்செல்கிறது.
            </p>
          </div>

          {/* Curricular Directory Links */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <span className="font-sans text-xs uppercase tracking-widest text-[#E3B7A0] font-semibold">
              Curricular Directory
            </span>
            <div className="flex flex-wrap gap-x-6 gap-y-2 font-sans text-xs text-[#FFEDDB]/75">
              <Link to="/workshops" className="hover:text-[#FFEDDB] transition-colors py-1">
                {language === "TA" ? "கண்டுபிடி" : "Discover"}
              </Link>
              <Link to="/participant/learning-paths" className="hover:text-[#FFEDDB] transition-colors py-1">
                {language === "TA" ? "கற்றல் பாதைகள்" : "Learning Paths"}
              </Link>
              <Link to="/participant/communities" className="hover:text-[#FFEDDB] transition-colors py-1">
                {language === "TA" ? "சமூகங்கள்" : "Communities"}
              </Link>
              <Link to="/participant/skills" className="hover:text-[#FFEDDB] transition-colors py-1">
                {language === "TA" ? "திறன் கடவுச்சீட்டு" : "Skill Passport"}
              </Link>
              <Link to="/about" className="hover:text-[#FFEDDB] transition-colors py-1">
                {language === "TA" ? "பற்றி" : "About"}
              </Link>
            </div>
          </div>

          {/* Language Selector */}
          <div className="md:col-span-2 flex flex-col gap-3 md:items-end">
            <span className="font-sans text-xs uppercase tracking-widest text-[#E3B7A0] font-semibold">
              Language
            </span>
            <div className="flex items-center gap-2 font-sans text-xs text-[#FFEDDB]/75 bg-[#261D1A] px-3 py-1.5 rounded-lg border border-[#DFC1B0]/20">
              <button
                type="button"
                onClick={() => setLanguage("EN")}
                className={`transition-colors ${language === "EN" ? "text-[#FFEDDB] font-bold" : "hover:text-[#E3B7A0]"}`}
              >
                English
              </button>
              <span className="text-[#DFC1B0]/40">·</span>
              <button
                type="button"
                onClick={() => setLanguage("TA")}
                className={`transition-colors ${language === "TA" ? "text-[#FFEDDB] font-bold font-serif" : "hover:text-[#E3B7A0]"}`}
              >
                தமிழ்
              </button>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#FFEDDB]/60 font-sans text-xs">
          <div>
            <span>© 2026 TRACE Academia · AUREX Ecosystem. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <Link to="/about" className="hover:text-[#FFEDDB] transition-colors">
              Archival Policies
            </Link>
            <Link to="/about" className="hover:text-[#FFEDDB] transition-colors">
              Citation & Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
