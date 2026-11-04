'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterDef {
  label: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
}

export function FilterBar({
  searchPlaceholder = 'Search...',
  searchValue,
  onSearch,
  filters = [],
}: {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearch?: (value: string) => void;
  filters?: FilterDef[];
}) {
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openFilter) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpenFilter(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenFilter(null);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [openFilter]);

  return (
    <div ref={rootRef} className="flex flex-wrap items-center gap-2 mb-4">
      <div className="relative flex-1 min-w-[200px] max-w-[360px]">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-p-icon pointer-events-none" aria-hidden="true" />
        <input
          type="search"
          value={searchValue}
          onChange={(e) => onSearch?.(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="h-9 w-full rounded-lg pl-9 pr-3 text-sm text-p-text placeholder:text-p-text-subdued bg-p-bg-surface border border-p-border-input focus:outline-none focus:ring-2 focus:ring-p-focus/30 focus:border-p-focus"
        />
      </div>
      {filters.map((filter) => (
        <div key={filter.label} className="relative">
          <button
            onClick={() => setOpenFilter(openFilter === filter.label ? null : filter.label)}
            aria-haspopup="listbox"
            aria-expanded={openFilter === filter.label}
            className="h-9 px-3 flex items-center gap-1.5 text-sm text-p-text bg-p-bg-surface border border-p-border-input rounded-lg hover:bg-p-bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p-focus/40"
          >
            {filter.value ?? filter.label}
            <ChevronDown size={14} className="text-p-icon" />
          </button>
          {openFilter === filter.label && (
            <div
              role="listbox"
              className="absolute top-full left-0 mt-1 bg-p-bg-surface border border-p-border-subdued rounded-lg shadow-p-popover z-20 min-w-[180px] py-1"
            >
              {filter.options.map((opt) => (
                <button
                  key={opt}
                  role="option"
                  aria-selected={filter.value === opt}
                  onClick={() => {
                    filter.onChange?.(opt);
                    setOpenFilter(null);
                  }}
                  className={cn(
                    'w-full text-left px-3 h-9 text-sm hover:bg-p-bg-surface-hover transition-colors',
                    filter.value === opt ? 'text-p-text font-semibold bg-p-bg-surface-selected' : 'text-p-text'
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
