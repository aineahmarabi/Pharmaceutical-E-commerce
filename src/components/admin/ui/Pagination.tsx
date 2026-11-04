import React from 'react';
import { Button } from './Button';

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}: {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-p-border-subdued">
      <p className="text-sm text-p-text-subdued tabular-nums" aria-live="polite">
        {start}–{end} of {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-sm text-p-text-subdued tabular-nums mr-1 hidden sm:inline">
          Page {Math.min(currentPage, totalPages)} of {totalPages}
        </span>
        <Button variant="secondary" size="sm" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
          Previous
        </Button>
        <Button variant="secondary" size="sm" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>
          Next
        </Button>
      </div>
    </nav>
  );
}
