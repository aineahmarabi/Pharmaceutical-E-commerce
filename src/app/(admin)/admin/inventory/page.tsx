'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertTriangle } from 'lucide-react';
import { TableRowSkeleton } from '@/components/ui/Skeleton';

const ease = [0.16, 1, 0.3, 1] as const;
const filters = ['All', 'Low stock', 'Out of stock'] as const;

export default function AdminInventoryPage() {
  const [filter, setFilter] = useState<typeof filters[number]>('All');

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }} className="flex items-center justify-between">
        <div>
          <p className="text-petrol-300 text-sm">Manage</p>
          <h2 className="font-display font-bold text-xl text-ink flex items-center gap-2">
            <AlertTriangle size={18} className="text-warning" />Inventory
          </h2>
        </div>
      </motion.div>

      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${filter === f ? 'bg-petrol text-paper' : 'bg-paper border border-line text-petrol-300 hover:text-ink'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-petrol-300" />
        <input className="w-full pl-8 pr-4 py-2.5 text-sm bg-paper border border-line rounded-xl focus:outline-none focus:border-petrol" placeholder="Search inventory…" disabled />
      </div>

      <div className="bg-paper rounded-2xl border border-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-porcelain/50">
                <th className="text-left px-4 py-3 text-xs font-mono text-petrol-300 uppercase tracking-wider">Product</th>
                <th className="text-left px-4 py-3 text-xs font-mono text-petrol-300 uppercase tracking-wider hidden sm:table-cell">SKU</th>
                <th className="text-left px-4 py-3 text-xs font-mono text-petrol-300 uppercase tracking-wider hidden md:table-cell">Class</th>
                <th className="text-right px-4 py-3 text-xs font-mono text-petrol-300 uppercase tracking-wider">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-mono text-petrol-300 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {Array.from({ length: 10 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
