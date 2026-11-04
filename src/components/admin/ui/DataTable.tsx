'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DataTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  hideOnMobile?: boolean;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'right';
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  selectable = false,
  selectedIds,
  onSelectionChange,
  onRowClick,
  emptyState,
  loading = false,
  loadingRows = 6,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
  /** Show skeleton rows instead of data. */
  loading?: boolean;
  loadingRows?: number;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);

  const selected = selectedIds ?? new Set<string>();
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someSelected = !allSelected && rows.some((r) => selected.has(r.id));

  const toggleAll = () => {
    if (!onSelectionChange) return;
    onSelectionChange(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  };

  const toggleRow = (id: string) => {
    if (!onSelectionChange) return;
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  const handleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else {
      setSortKey(null);
      setSortDir(null);
    }
  };

  let sortedRows = rows;
  if (sortKey && sortDir) {
    sortedRows = [...rows].sort((a, b) => {
      const av = (a as Record<string, string | number>)[sortKey];
      const bv = (b as Record<string, string | number>)[sortKey];
      if (av === bv) return 0;
      const cmp = av > bv ? 1 : -1;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }

  if (!loading && rows.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  const checkboxClass =
    'w-4 h-4 rounded border-p-border-input accent-[var(--color-p-primary)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p-focus focus-visible:ring-offset-1';

  return (
    <div className="-mx-5 overflow-auto max-h-[calc(100vh-16rem)] admin-scroll">
      <table className="w-full min-w-[600px] border-separate border-spacing-0">
        <thead>
          <tr>
            {selectable && (
              <th className="sticky top-0 z-10 w-12 px-4 h-10 bg-p-bg-surface-subdued border-b border-p-border-subdued">
                <input
                  type="checkbox"
                  aria-label="Select all rows"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                  className={checkboxClass}
                />
              </th>
            )}
            {columns.map((col) => {
              const sorted = sortKey === col.key ? sortDir : null;
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined}
                  className={cn(
                    'sticky top-0 z-10 px-4 h-10 bg-p-bg-surface-subdued border-b border-p-border-subdued',
                    'text-xs font-semibold text-p-text-subdued whitespace-nowrap',
                    col.align === 'right' ? 'text-right' : 'text-left',
                    col.hideOnMobile && 'hidden md:table-cell'
                  )}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className={cn(
                        'inline-flex items-center gap-1 -mx-1.5 px-1.5 h-7 rounded-md hover:bg-p-bg-surface-active hover:text-p-text',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p-focus',
                        col.align === 'right' && 'flex-row-reverse',
                        sorted && 'text-p-text'
                      )}
                    >
                      {col.label}
                      {sorted === 'asc' ? (
                        <ChevronUp size={13} />
                      ) : sorted === 'desc' ? (
                        <ChevronDown size={13} />
                      ) : (
                        <ChevronsUpDown size={13} className="opacity-40" />
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: loadingRows }).map((_, i) => (
                <tr key={`sk-${i}`} aria-hidden="true">
                  {selectable && (
                    <td className="px-4 h-14 border-b border-p-border-subdued">
                      <div className="w-4 h-4 rounded bg-p-bg-surface-active animate-pulse motion-reduce:animate-none" />
                    </td>
                  )}
                  {columns.map((col, ci) => (
                    <td
                      key={col.key}
                      className={cn('px-4 h-14 border-b border-p-border-subdued', col.hideOnMobile && 'hidden md:table-cell')}
                    >
                      <div
                        className={cn(
                          'h-3.5 rounded bg-p-bg-surface-active animate-pulse motion-reduce:animate-none',
                          col.align === 'right' && 'ml-auto',
                          ci === 0 ? 'w-3/4' : 'w-1/2'
                        )}
                      />
                    </td>
                  ))}
                </tr>
              ))
            : sortedRows.map((row) => {
                const isSelected = selected.has(row.id);
                const cellBg = isSelected ? 'bg-p-bg-surface-selected' : onRowClick ? 'group-hover:bg-p-bg-surface-hover' : '';
                return (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row)}
                    onKeyDown={
                      onRowClick
                        ? (e) => {
                            if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                              e.preventDefault();
                              onRowClick(row);
                            }
                          }
                        : undefined
                    }
                    tabIndex={onRowClick ? 0 : undefined}
                    aria-selected={selectable ? isSelected : undefined}
                    className={cn(
                      'group text-sm text-p-text',
                      onRowClick && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-p-focus'
                    )}
                  >
                    {selectable && (
                      <td
                        className={cn(
                          'px-4 h-14 w-12 border-b border-p-border-subdued transition-colors',
                          isSelected && 'shadow-[inset_3px_0_0_var(--color-p-primary)]',
                          cellBg
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          aria-label={`Select row ${row.id}`}
                          checked={isSelected}
                          onChange={() => toggleRow(row.id)}
                          className={checkboxClass}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 h-14 border-b border-p-border-subdued transition-colors',
                          col.align === 'right' ? 'text-right' : 'text-left',
                          col.hideOnMobile && 'hidden md:table-cell',
                          cellBg
                        )}
                      >
                        {col.render ? col.render(row) : (row as Record<string, React.ReactNode>)[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
}
