export function WorkshopSelector({
  workshops,
  selectedId,
  onSelect,
  isLoading,
}: {
  workshops?: { id: string; title: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <span className="text-xs text-[#5F524B] italic">Loading workshops...</span>;
  }

  if (!workshops || workshops.length === 0) {
    return <span className="text-xs font-semibold text-[#BF9270]">No workshops available</span>;
  }

  if (workshops.length === 1) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#BF9270]">Workshop Context</span>
        <span className="font-semibold text-sm text-[#1A1412] px-2 py-1 bg-[#FFEDDB]/50 rounded-md border border-[#DFC1B0]/30">
          {workshops[0].title}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="workshop-select" className="text-xs font-bold uppercase tracking-wider text-[#BF9270]">
        Workshop
      </label>
      <select
        id="workshop-select"
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        className="text-sm font-semibold text-[#1A1412] bg-[#FFEDDB]/30 border border-[#DFC1B0]/60 rounded-md px-3 py-1.5 focus:outline-none focus:border-[#BF9270] focus:ring-1 focus:ring-[#BF9270] transition-colors shadow-sm cursor-pointer"
      >
        {workshops.map((w) => (
          <option key={w.id} value={w.id}>
            {w.title}
          </option>
        ))}
      </select>
    </div>
  );
}
