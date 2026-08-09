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
    <div className="flex items-center justify-between px-4 py-4 border-t border-p-border-subdued">
      <p className="text-sm text-p-text-subdued">
        Showing {start}–{end} of {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
          Previous
        </Button>
        <Button variant="secondary" size="sm" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
