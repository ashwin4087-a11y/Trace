import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FFEDDB] text-[#1A1412] antialiased">
      <Navbar />
      <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 md:px-8 pt-24 pb-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}
