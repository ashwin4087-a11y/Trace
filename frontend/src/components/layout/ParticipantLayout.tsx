import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

const items = [
  { to: "/participant", label: "Overview" },
  { to: "/participant/profile", label: "Profile" },
  { to: "/participant/academic-profile", label: "Academic profile" },
  { to: "/participant/workshops", label: "My workshops" },
  { to: "/participant/sessions", label: "Sessions" },
  { to: "/participant/attendance", label: "Attendance" },
  { to: "/participant/assessments", label: "Assessments" },
  { to: "/participant/certificates", label: "Certificates" },
  { to: "/participant/notifications", label: "Notifications" },
  { to: "/participant/recommendations", label: "Recommendations" },
  { to: "/participant/communities", label: "Communities" },
  { to: "/participant/learning-paths", label: "Learning paths" },
  { to: "/participant/skills", label: "Skill passport" },
];

export function ParticipantLayout({ title, children }: { title: string; children: ReactNode }) {
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
