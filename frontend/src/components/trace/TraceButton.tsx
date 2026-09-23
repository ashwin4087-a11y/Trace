import type { ButtonHTMLAttributes, ReactNode } from "react";

type TraceButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  icon?: string;
};

export function TraceButton({
  variant = "primary",
  size = "md",
  children,
  icon,
  className = "",
  disabled,
  ...props
}: TraceButtonProps) {
  const baseStyle =
    "inline-flex items-center justify-center font-sans font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#BF9270]/40 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-[#BF9270] hover:bg-[#261D1A] text-[#FFEDDB] shadow-xs hover:shadow-sm",
    secondary: "bg-[#FFFFFF] border border-[#DFC1B0] text-[#1A1412] hover:bg-[#FFEDDB] hover:border-[#BF9270]",
    ghost: "bg-transparent text-[#BF9270] hover:text-[#261D1A] underline-offset-4 hover:underline",
    danger: "bg-[#9f2d2d] text-[#FFFFFF] hover:bg-[#1A1412]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-xs md:text-sm gap-2",
    lg: "px-6 py-3 text-sm md:text-base gap-2.5",
  };

  return (
    <button
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
