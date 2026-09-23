export function Header({ title, detail }: { title: string; detail?: string }) {
  return (
    <header className="mb-6 border-b border-[#DFC1B0]/60 pb-4">
      <h1 className="font-serif text-3xl md:text-4xl text-[#1A1412] font-normal tracking-tight">{title}</h1>
      {detail ? <p className="mt-1 font-sans text-xs md:text-sm text-[#5F524B]">{detail}</p> : null}
    </header>
  );
}
