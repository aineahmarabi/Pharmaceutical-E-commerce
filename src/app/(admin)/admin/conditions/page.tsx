'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { TableRowSkeleton } from '@/components/ui/Skeleton';

const ease = [0.16, 1, 0.3, 1] as const;

export default function AdminConditionsPage() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }} className="flex items-center justify-between">
        <div>
          <p className="text-petrol-300 text-sm">Manage</p>
          <h2 className="font-display font-bold text-xl text-ink">Conditions</h2>
        </div>
        <button className="flex items-center gap-1.5 bg-petrol text-paper text-sm font-medium px-4 py-2 rounded-xl hover:bg-petrol/90 transition-colors">
          <Plus size={14} />Add condition
        </button>
      </motion.div>

      <div className="bg-paper rounded-2xl border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-porcelain/50">
              <th className="text-left px-4 py-3 text-xs font-mono text-petrol-300 uppercase tracking-wider">Condition</th>
              <th className="text-left px-4 py-3 text-xs font-mono text-petrol-300 uppercase tracking-wider hidden sm:table-cell">Description</th>
              <th className="text-right px-4 py-3 text-xs font-mono text-petrol-300 uppercase tracking-wider">Products</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {Array.from({ length: 10 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
