import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

const items = [
  { to: "/organizer", label: "Overview" },
  { to: "/organizer/workshops", label: "Workshops" },
  { to: "/organizer/workshops/new", label: "Create workshop" },
  { to: "/organizer/sessions", label: "Sessions" },
  { to: "/organizer/participants", label: "Participants" },
  { to: "/organizer/attendance", label: "Attendance" },
  { to: "/organizer/assessments", label: "Assessments" },
  { to: "/organizer/certificates", label: "Certificates" },
  { to: "/organizer/announcements", label: "Announcements" },
  { to: "/organizer/analytics", label: "Analytics" },
];

export function OrganizerLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar items={items} />
        <main className="flex-1 px-6 py-6">
          <Header title={title} />
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
