import { NavLink } from "react-router-dom";

export function Sidebar({ items }: { items: { to: string; label: string }[] }) {
  return (
    <aside className="w-56 shrink-0 border-r border-line bg-card p-4">
      <nav className="flex flex-col gap-1 text-sm">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.split("/").length <= 2}
            className={({ isActive }) => `rounded px-3 py-2 ${isActive ? "bg-brand text-white" : "hover:bg-paper"}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
