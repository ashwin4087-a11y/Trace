import type { InputHTMLAttributes } from "react";

export function Input({ label, error, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold">{label}</span>
      <input className="w-full rounded-md border border-line bg-white px-3 py-2" {...props} />
      {error ? <span className="mt-1 block text-danger">{error}</span> : null}
    </label>
  );
}
