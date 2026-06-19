'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { TableRowSkeleton, Skeleton } from '@/components/ui/Skeleton';

const ease = [0.16, 1, 0.3, 1] as const;

export default function AdminOrdersPage() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }} className="flex items-center justify-between">
        <div>
          <p className="text-petrol-300 text-sm">Manage</p>
          <h2 className="font-display font-bold text-xl text-ink">Orders</h2>
        </div>
      </motion.div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-petrol-300" />
        <input className="w-full pl-8 pr-4 py-2.5 text-sm bg-paper border border-line rounded-xl focus:outline-none focus:border-petrol" placeholder="Search orders…" disabled />
      </div>

      <div className="bg-paper rounded-2xl border border-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-porcelain/50">
                <th className="text-left px-4 py-3 text-xs font-mono text-petrol-300 uppercase tracking-wider">Order ID</th>
                <th className="text-left px-4 py-3 text-xs font-mono text-petrol-300 uppercase tracking-wider hidden sm:table-cell">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-mono text-petrol-300 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-mono text-petrol-300 uppercase tracking-wider hidden md:table-cell">Total</th>
                <th className="text-left px-4 py-3 text-xs font-mono text-petrol-300 uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {Array.from({ length: 8 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={6} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
