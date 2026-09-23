import { TraceButton } from "./TraceButton";

type TraceErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export function TraceErrorState({
  message = "An unexpected error occurred while loading this section.",
  onRetry,
}: TraceErrorStateProps) {
  return (
    <div className="w-full bg-[#FFFFFF] border border-[#9f2d2d]/30 rounded-xl p-6 md:p-8 flex flex-col items-center justify-center text-center my-4">
      <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#93000a] flex items-center justify-center mb-3">
        <span className="material-symbols-outlined text-[24px]">error_outline</span>
      </div>
      <h3 className="font-serif text-lg text-[#1A1412] font-semibold mb-1">
        Unable to load data
      </h3>
      <p className="font-sans text-xs md:text-sm text-[#5F524B] max-w-md mb-4">{message}</p>
      {onRetry && (
        <TraceButton variant="secondary" size="sm" onClick={onRetry} icon="refresh">
          Try Again
        </TraceButton>
      )}
    </div>
  );
}
