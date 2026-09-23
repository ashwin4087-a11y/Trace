type TraceProgressProps = {
  value: number; // 0 - 100
  max?: number;
  label?: string;
  showPercent?: boolean;
  className?: string;
};

export function TraceProgress({
  value,
  max = 100,
  label,
  showPercent = false,
  className = "",
}: TraceProgressProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center font-sans text-xs">
          {label && <span className="text-[#5F524B] font-medium">{label}</span>}
          {showPercent && <span className="text-[#BF9270] font-semibold">{percentage}%</span>}
        </div>
      )}
      <div className="w-full h-2 rounded-full bg-[#EDCDBB] overflow-hidden">
        <div
          className="h-full bg-[#BF9270] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
