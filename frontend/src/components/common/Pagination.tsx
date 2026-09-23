export function Pagination({ page, pageCount, onPage }: { page: number; pageCount: number; onPage: (page: number) => void }) {
  return (
    <div className="mt-4 flex items-center gap-2 text-sm">
      <button className="rounded border border-line px-2 py-1" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button>
      <span>{page} / {pageCount}</span>
      <button className="rounded border border-line px-2 py-1" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>Next</button>
    </div>
  );
}
