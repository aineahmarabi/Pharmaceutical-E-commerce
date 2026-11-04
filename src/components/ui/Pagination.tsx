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

  const nav =
    'w-9 h-9 flex items-center justify-center rounded-lg border border-line bg-paper text-ink hover:bg-porcelain disabled:opacity-40 disabled:hover:bg-paper transition-transform duration-100 active:scale-[0.97]';

  return (
    <nav className={cn('flex items-center justify-center gap-1.5', className)} aria-label="Pagination">
      <button type="button" onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1} className={nav} aria-label="Previous page">
        <ChevronLeft size={14} />
      </button>

      {pages.map((p, i) => {
        const prev = pages[i - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <React.Fragment key={p}>
            {showEllipsis && <span className="px-1 text-muted-fg text-sm">…</span>}
            <button
              type="button"
              onClick={() => onChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={cn(
                'min-w-9 h-9 px-2 flex items-center justify-center rounded-lg text-sm font-medium tabular-nums transition-colors',
                p === page ? 'bg-petrol text-white' : 'text-ink hover:bg-porcelain'
              )}
            >
              {p}
            </button>
          </React.Fragment>
        );
      })}

      <button type="button" onClick={() => onChange(Math.min(pageCount, page + 1))} disabled={page === pageCount} className={nav} aria-label="Next page">
        <ChevronRight size={14} />
      </button>
    </nav>
  );
}
