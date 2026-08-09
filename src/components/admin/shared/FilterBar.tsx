'use client';

import React, { useState } from 'react';
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

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-p-text-disabled" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearch?.(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-9 w-full rounded-lg pl-8 pr-3 text-sm bg-p-bg-surface border border-p-border-input focus:outline-none focus:shadow-[0_0_0_1px_var(--color-p-focus)] focus:border-p-focus"
        />
      </div>
      {filters.map((filter) => (
        <div key={filter.label} className="relative">
          <button
            onClick={() => setOpenFilter(openFilter === filter.label ? null : filter.label)}
            className="h-9 px-3.5 flex items-center gap-1.5 text-sm text-p-text bg-p-bg-surface border border-p-border-input rounded-lg hover:bg-p-bg transition-colors"
          >
            {filter.value ?? filter.label}
            <ChevronDown size={14} />
          </button>
          {openFilter === filter.label && (
            <div className="absolute top-full left-0 mt-1 bg-p-bg-surface border border-p-border-subdued rounded-lg shadow-p-popover z-20 min-w-[160px] py-1">
              {filter.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    filter.onChange?.(opt);
                    setOpenFilter(null);
                  }}
                  className={cn(
                    'w-full text-left px-3 py-1.5 text-sm hover:bg-p-bg transition-colors',
                    filter.value === opt ? 'text-p-text font-medium' : 'text-p-text-subdued'
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
