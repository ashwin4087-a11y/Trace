import type { ReactNode } from "react";
import { TraceButton } from "./TraceButton";

type TraceEmptyStateProps = {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
};

export function TraceEmptyState({
  icon = "auto_stories",
  title,
  description,
  actionLabel,
  onAction,
  children,
}: TraceEmptyStateProps) {
  return (
    <div className="w-full bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-8 md:p-12 flex flex-col items-center justify-center text-center my-4">
      <div className="w-14 h-14 rounded-full bg-[#FFEDDB] border border-[#DFC1B0] flex items-center justify-center text-[#BF9270] mb-4 shadow-xs">
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
      <h3 className="font-serif text-xl md:text-2xl text-[#1A1412] font-normal tracking-tight mb-2">
        {title}
      </h3>
      <p className="font-sans text-sm text-[#5F524B] max-w-md leading-relaxed mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <TraceButton variant="primary" onClick={onAction}>
          {actionLabel}
        </TraceButton>
      )}
      {children}
    </div>
  );
}
