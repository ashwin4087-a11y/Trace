import type { ReactNode } from "react";
import { TraceNavbar } from "./TraceNavbar";
import { TraceFooter } from "./TraceFooter";

export function TracePageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFEDDB] text-[#1A1412] antialiased selection:bg-[#EDCDBB] selection:text-[#1A1412]">
      <TraceNavbar />
      <main className="flex-1 w-full pt-20">
        {children}
      </main>
      <TraceFooter />
    </div>
  );
}
