import { NavLink } from "react-router-dom";

export function Sidebar({ items }: { items: { to: string; label: string; end?: boolean }[] }) {
  return (
    <aside className="w-60 shrink-0 border-r border-[#DFC1B0] bg-[#FFFFFF] p-4 hidden md:block min-h-[calc(100vh-5rem)]">
      <nav className="flex flex-col gap-1.5 font-sans text-xs">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end ?? item.to.split("/").length <= 2}
            className={({ isActive }) =>
              `rounded-lg px-3.5 py-2.5 transition-colors font-medium flex items-center justify-between ${
                isActive
                  ? "bg-[#BF9270] text-[#FFEDDB] font-semibold shadow-xs"
                  : "text-[#1A1412] hover:bg-[#EDCDBB]/50 hover:text-[#261D1A]"
              }`
            }
          >
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
