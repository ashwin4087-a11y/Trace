import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

const items = [
  { to: "/organizer", label: "Overview" },
  { to: "/organizer/workshops", label: "Workshops" },
  { to: "/organizer/workshops/new", label: "Create Workshop" },
  { to: "/organizer/sessions", label: "Sessions" },
  { to: "/organizer/participants", label: "Participants" },
  { to: "/organizer/attendance", label: "Attendance" },
  { to: "/organizer/assessments", label: "Assessments" },
  { to: "/organizer/certificates", label: "Certificates" },
  { to: "/organizer/announcements", label: "Announcements" },
  { to: "/organizer/analytics", label: "Analytics" },
];

export function OrganizerLayout({ title, children }: { title: string; children: ReactNode }) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#FFEDDB] text-[#1A1412] antialiased">
      <Navbar />
      
      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden pt-20 px-4 py-2 bg-[#FFFFFF] border-b border-[#DFC1B0] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#BF9270]"></span>
          <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">
            Organizer Console
          </span>
        </div>
        <button
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="text-xs font-sans font-semibold text-[#1A1412] px-3 py-1 bg-[#FFEDDB] border border-[#DFC1B0] rounded-lg"
        >
          {mobileDrawerOpen ? "Close Menu" : "Console Navigation"}
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
      <Footer />
    </div>
  );
}
