// src/components/stations/TablePagination.tsx
'use client';

export default function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canPrev}
      >
        Précédent
      </button>
      <span className="text-sm">
        Page {currentPage} / {Math.max(totalPages, 1)}
      </span>
      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canNext}
      >
        Suivant
      </button>
    </div>
  );
}