'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { downloadCsv } from '@/lib/exportCsv';

export function ExportButton({ filename, rows }: { filename: string; rows: Record<string, string | number>[] }) {
  return (
    <button
      onClick={() => downloadCsv(filename, rows)}
      disabled={rows.length === 0}
      className="flex items-center gap-1.5 text-p-focus hover:underline disabled:opacity-40 disabled:pointer-events-none"
    >
      <Download size={13} />
      Export CSV
    </button>
  );
}
