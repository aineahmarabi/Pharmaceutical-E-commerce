'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminAuditLogPage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="bg-paper rounded-2xl border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-porcelain border-b border-line">
            <tr>
              {['Actor', 'Action', 'Target', 'Time'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-petrol-300 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i}>
                {[0, 1, 2, 3].map((j) => (
                  <td key={j} className="px-5 py-3">
                    <Skeleton className="h-4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
