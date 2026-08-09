import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, pageCount, onChange, className }: PaginationProps) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1
  );

  return (
    <div className={cn('flex items-center justify-center gap-1.5', className)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-line text-ink hover:bg-petrol-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft size={14} />
      </button>

      {pages.map((p, i) => {
        const prev = pages[i - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <React.Fragment key={p}>
            {showEllipsis && <span className="px-1 text-petrol-300 text-sm">…</span>}
            <button
              type="button"
              onClick={() => onChange(p)}
              className={cn(
                'w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors',
                p === page ? 'bg-petrol text-paper' : 'text-ink hover:bg-petrol-50'
              )}
            >
              {p}
            </button>
          </React.Fragment>
        );
      })}

      <button
        type="button"
        onClick={() => onChange(Math.min(pageCount, page + 1))}
        disabled={page === pageCount}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-line text-ink hover:bg-petrol-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        aria-label="Next page"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
