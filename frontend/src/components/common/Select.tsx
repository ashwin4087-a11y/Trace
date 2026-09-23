import type { SelectHTMLAttributes } from "react";

export function Select({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold">{label}</span>
      <select className="w-full rounded-md border border-line bg-white px-3 py-2" {...props}>
        {children}
      </select>
    </label>
  );
}
