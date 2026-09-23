import { useState, type InputHTMLAttributes } from "react";

export function PasswordInput({
  label,
  error,
  labelClassName,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; labelClassName?: string }) {
  const [showPassword, setShowPassword] = useState(false);

  const { className, ...restProps } = props;

  return (
    <label className="block text-sm flex flex-col gap-1">
      {label && <span className={labelClassName || "mb-1 block font-semibold"}>{label}</span>}
      <div className="relative">
        <input
          className={`w-full rounded-md border border-line bg-white px-3 py-2 pr-10 ${className || ""}`}
          type={showPassword ? "text" : "password"}
          {...restProps}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-ink/60 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta rounded-md"
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          )}
        </button>
      </div>
      {error ? <span className="mt-1 block text-danger">{error}</span> : null}
    </label>
  );
}
