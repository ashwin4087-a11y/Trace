import type { ReactNode } from "react";

type TraceCardProps = {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
};

export function TraceCard({ children, className = "", hoverEffect = false, onClick }: TraceCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#FFFFFF] border border-[#DFC1B0] rounded-lg p-6 shadow-xs ${
        hoverEffect ? "hover:shadow-md hover:border-[#BF9270] transition-all duration-200" : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
