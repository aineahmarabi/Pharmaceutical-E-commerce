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
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);

  const selected = selectedIds ?? new Set<string>();
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));

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
      const av = (a as any)[sortKey];
      const bv = (b as any)[sortKey];
      if (av === bv) return 0;
      const cmp = av > bv ? 1 : -1;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }

  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse">
        <thead>
          <tr className="bg-p-bg h-11">
            {selectable && (
              <th className="w-11 px-4">
                <input
                  type="checkbox"
                  aria-label="Select all rows"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="w-[18px] h-[18px] rounded accent-[#0D9488]"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'px-4 text-[13px] font-semibold text-p-text-subdued uppercase tracking-wide whitespace-nowrap',
                  col.align === 'right' ? 'text-right' : 'text-left',
                  col.hideOnMobile && 'hidden md:table-cell'
                )}
              >
                {col.sortable ? (
                  <button
                    onClick={() => handleSort(col.key)}
                    className="inline-flex items-center gap-1 hover:text-p-text group"
                  >
                    {col.label}
                    {sortKey === col.key ? (
                      sortDir === 'asc' ? <ChevronUp size={13} className="text-p-text" /> : <ChevronDown size={13} className="text-p-text" />
                    ) : (
                      <ChevronsUpDown size={13} className="opacity-0 group-hover:opacity-100" />
                    )}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => {
            const isSelected = selected.has(row.id);
            return (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'h-[52px] border-b border-p-border-subdued text-sm text-p-text transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-p-bg',
                  isSelected && 'bg-p-bg-surface-selected border-l-[3px] border-l-p-focus'
                )}
              >
                {selectable && (
                  <td className="px-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      aria-label={`Select row ${row.id}`}
                      checked={isSelected}
                      onChange={() => toggleRow(row.id)}
                      className="w-[18px] h-[18px] rounded accent-[#0D9488]"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4',
                      col.align === 'right' ? 'text-right' : 'text-left',
                      col.hideOnMobile && 'hidden md:table-cell'
                    )}
                  >
                    {col.render ? col.render(row) : (row as any)[col.key]}
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
