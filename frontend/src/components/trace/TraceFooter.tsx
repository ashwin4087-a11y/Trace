import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";

export function TraceFooter() {
  const { language } = useApp();

  return (
    <footer className="w-full bg-[#1A1412] text-[#FFEDDB] border-t border-[#261D1A] py-12 px-4 md:px-8 mt-auto">
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Editorial Brand Column */}
        <div className="md:col-span-6 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#BF9270] flex items-center justify-center font-serif text-base font-bold text-[#1A1412]">
              T
            </div>
            <span className="font-serif text-xl font-semibold tracking-wide text-[#FFEDDB]">
              TRACE Academia
            </span>
          </div>
          <p className="font-serif italic text-lg text-[#E3B7A0]/90">
            “Every learning experience leaves a trace.”
          </p>
          <p className="font-sans text-xs text-[#FFEDDB]/70">
            {language === "TA"
              ? "ஒவ்வொரு கற்றல் அனுபவமும் ஒரு தடம் விட்டுச் செல்கிறது."
              : "A human-centered digital registry for lifelong scholars, researchers, and continuous learners."}
          </p>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-3 flex flex-col gap-2 font-sans text-xs">
          <span className="font-semibold text-[#BF9270] uppercase tracking-wider text-[11px] mb-1">
            {language === "TA" ? "வழிசெலுத்தல்" : "Navigation"}
          </span>
          <Link to="/workshops" className="hover:text-[#BF9270] transition-colors">
            {language === "TA" ? "பட்டறைகள்" : "Discover Workshops"}
          </Link>
          <Link to="/participant" className="hover:text-[#BF9270] transition-colors">
            {language === "TA" ? "கற்றல் மையம்" : "Scholar Overview"}
          </Link>
          <Link to="/participant/communities" className="hover:text-[#BF9270] transition-colors">
            {language === "TA" ? "கல்விச் சமூகங்கள்" : "Academic Guilds"}
          </Link>
          <Link to="/participant/learning-paths" className="hover:text-[#BF9270] transition-colors">
            {language === "TA" ? "கற்றல் பாதைகள்" : "Learning Paths"}
          </Link>
          <Link to="/participant/skills" className="hover:text-[#BF9270] transition-colors">
            {language === "TA" ? "திறன் சான்றிதழ்கள்" : "Skill Passport"}
          </Link>
        </div>

        {/* Copyright & System Info */}
        <div className="md:col-span-3 flex flex-col gap-2 font-sans text-xs text-[#FFEDDB]/60">
          <span className="font-semibold text-[#BF9270] uppercase tracking-wider text-[11px] mb-1">
            AUREX Syndicate
          </span>
          <span>TRACE Version 2026.4</span>
          <span>Tamil Nadu Academic Framework</span>
          <span className="mt-2 text-[11px] text-[#FFEDDB]/40">
            © {new Date().getFullYear()} TRACE Academia. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
