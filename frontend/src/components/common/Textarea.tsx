import type { TextareaHTMLAttributes } from "react";

export function Textarea({
  label,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold">{label}</span>
      <textarea className="min-h-28 w-full rounded-md border border-line bg-white px-3 py-2" {...props} />
    </label>
  );
}
