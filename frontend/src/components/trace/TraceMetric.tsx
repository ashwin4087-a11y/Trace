type TraceMetricProps = {
  label: string;
  value: string | number;
  subtitle?: string;
  highlight?: boolean;
};

export function TraceMetric({ label, value, subtitle, highlight = false }: TraceMetricProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-baseline gap-1.5">
        <span
          className={`font-serif text-3xl md:text-4xl font-normal leading-none ${
            highlight ? "text-[#BF9270]" : "text-[#1A1412]"
          }`}
        >
          {value}
        </span>
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#5F524B]">
          {label}
        </span>
      </div>
      {subtitle && <span className="font-sans text-xs text-[#5F524B] mt-1">{subtitle}</span>}
    </div>
  );
}
