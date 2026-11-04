'use client';

import React from 'react';
import { downloadCsv } from '@/lib/exportCsv';

export function ExportButton({ filename, rows }: { filename: string; rows: Record<string, string | number>[] }) {
  return (
    <button
      onClick={() => downloadCsv(filename, rows)}
      disabled={rows.length === 0}
      className="inline-flex items-center h-8 px-2 rounded-lg text-sm font-medium text-p-text-primary hover:bg-p-bg-surface-hover hover:underline disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p-focus"
    >
      Export CSV
    </button>
  );
}
