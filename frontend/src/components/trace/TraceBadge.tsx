import type { ReactNode } from "react";

type TraceBadgeProps = {
  children: ReactNode;
  variant?: "default" | "terracotta" | "cream" | "dark" | "outline";
  size?: "sm" | "md";
  className?: string;
};

export function TraceBadge({ children, variant = "default", size = "sm", className = "" }: TraceBadgeProps) {
  const base = "inline-flex items-center font-sans uppercase tracking-wider font-semibold rounded-full";
  
  const variants = {
    default: "bg-[#EDCDBB] text-[#1A1412]",
    terracotta: "bg-[#BF9270] text-[#FFEDDB]",
    cream: "bg-[#FFEDDB] text-[#5F524B] border border-[#DFC1B0]/60",
    dark: "bg-[#1A1412] text-[#FFEDDB]",
    outline: "bg-transparent border border-[#DFC1B0] text-[#5F524B]",
  };

  const sizes = {
    sm: "px-2.5 py-0.5 text-[10px] md:text-[11px]",
    md: "px-3.5 py-1 text-xs",
  };

  return <span className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>{children}</span>;
}
