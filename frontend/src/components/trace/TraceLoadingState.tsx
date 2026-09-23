export function TraceLoadingState({ count = 3 }: { count?: number }) {
  return (
    <div className="w-full space-y-4 my-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-full bg-[#FFFFFF] border border-[#DFC1B0]/60 rounded-xl p-6 flex flex-col gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#EDCDBB]/50" />
            <div className="h-4 w-1/3 bg-[#EDCDBB]/60 rounded" />
          </div>
          <div className="h-6 w-3/4 bg-[#EDCDBB]/40 rounded" />
          <div className="h-4 w-5/6 bg-[#EDCDBB]/30 rounded" />
        </div>
      ))}
    </div>
  );
}
