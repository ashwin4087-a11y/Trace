import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

const items = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/organizers", label: "Organizers" },
  { to: "/admin/organizations", label: "Organizations" },
  { to: "/admin/departments", label: "Departments" },
  { to: "/admin/audit-logs", label: "Audit logs" },
  { to: "/admin/settings", label: "Settings" },
];

export function AdminLayout({ title, children }: { title: string; children: ReactNode }) {
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
