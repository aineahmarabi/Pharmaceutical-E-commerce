'use client';

import React from 'react';
import { Plus, UserCircle } from 'lucide-react';
import { TableRowSkeleton } from '@/components/ui/Skeleton';

export default function AdminStaffPage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-petrol-300">Staff members</p>
        <button className="flex items-center gap-1.5 bg-petrol hover:bg-petrol-700 text-paper font-semibold text-sm px-4 py-2 rounded-xl transition-all">
          <Plus size={14} />Add Staff
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-paper rounded-2xl border border-line p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-petrol-50 skeleton-shimmer flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-36 bg-petrol-50 rounded-lg skeleton-shimmer" />
              <div className="h-3 w-24 bg-petrol-50 rounded-lg skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
