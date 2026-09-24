import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { TraceFooter } from "../trace/TraceFooter";
import { TraceNavbar } from "../trace/TraceNavbar";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

const items = [
  { to: "/participant", label: "Overview" },
  { to: "/participant/profile", label: "Profile" },
  { to: "/participant/academic-profile", label: "Academic Profile" },
  { to: "/participant/workshops", label: "Learn" },
  { to: "/participant/sessions", label: "Sessions" },
  { to: "/participant/attendance", label: "Attendance" },
  { to: "/participant/assessments", label: "Assessments" },
  { to: "/participant/certificates", label: "Certificates" },
  { to: "/participant/notifications", label: "Notifications" },
  { to: "/participant/recommendations", label: "Recommendations" },
  { to: "/participant/communities", label: "Communities" },
  { to: "/participant/learning-paths", label: "Learning Paths" },
  { to: "/participant/skills", label: "Skill Passport" },
];

export function ParticipantLayout({ title, children }: { title: string; children: ReactNode }) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#FFEDDB] text-[#1A1412] antialiased">
      <TraceNavbar />

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden pt-20 px-4 py-2 bg-[#FFFFFF] border-b border-[#DFC1B0] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#BF9270]"></span>
          <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">
            Scholar Workspace
          </span>
        </div>
        <button
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="text-xs font-sans font-semibold text-[#1A1412] px-3 py-1 bg-[#FFEDDB] border border-[#DFC1B0] rounded-lg"
        >
          {mobileDrawerOpen ? "Close Menu" : "Scholar Navigation"}
        </button>
      </div>

      {mobileDrawerOpen && (
        <div className="md:hidden bg-[#FFFFFF] border-b border-[#DFC1B0] p-4 flex flex-col gap-2">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileDrawerOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-xs font-sans ${
                  isActive ? "bg-[#BF9270] text-[#FFEDDB] font-semibold" : "text-[#1A1412] hover:bg-[#FFEDDB]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}

      <div className="flex flex-1 pt-20 md:pt-20 max-w-[1440px] w-full mx-auto">
        <Sidebar items={items} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 w-full max-w-full overflow-x-hidden">
          <Header title={title} />
          {children}
        </main>
      </div>
      <TraceFooter />
    </div>
  );
}
