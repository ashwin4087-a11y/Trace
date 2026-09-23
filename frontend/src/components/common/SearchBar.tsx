export function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder ?? "Search"}
      className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm"
    />
  );
}
