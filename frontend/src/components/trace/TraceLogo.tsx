import { Link } from "react-router-dom";

interface TraceLogoProps {
  to?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TraceLogoMark({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="TRACE Symbol"
    >
      {/* Terracotta stroke tip on the top-left */}
      <path
        d="M 22 42 C 20 28, 28 18, 38 18"
        stroke="#BF9270"
        strokeWidth="9"
        strokeLinecap="round"
      />
      {/* Charcoal main T-loop stroke */}
      <path
        d="M 38 18 H 72 C 84 18, 84 38, 70 42 C 54 48, 38 64, 50 82 C 58 90, 68 84, 68 70 V 36"
        stroke="#1A1412"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TraceLogo({ to = "/", size = "md", className = "" }: TraceLogoProps) {
  const markDimensions = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-10 w-10" : "h-8 w-8";
  const textSizes = size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl";
  const subtextSizes = size === "sm" ? "text-[10px]" : size === "lg" ? "text-xs" : "text-[11px]";

  const content = (
    <div className={`inline-flex items-center gap-2.5 group cursor-pointer ${className}`}>
      <TraceLogoMark className={`${markDimensions} shrink-0 transition-transform group-hover:scale-105`} />
      <div className="flex items-center gap-2">
        <span className={`font-serif font-semibold text-[#1A1412] tracking-tight group-hover:text-[#BF9270] transition-colors ${textSizes}`}>
          TRACE
        </span>
        <span className="h-4 w-px bg-[#DFC1B0]"></span>
        <span className={`font-sans font-bold uppercase tracking-widest text-[#5F524B] ${subtextSizes}`}>
          Academia
        </span>
      </div>
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return content;
}
