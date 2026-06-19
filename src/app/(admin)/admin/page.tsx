'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { StatCardSkeleton, ChartSkeleton, RowSkeleton } from '@/components/ui/Skeleton';

const ease = [0.16, 1, 0.3, 1] as const;

export default function AdminDashboard() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }}>
        <p className="text-petrol-300 text-sm">Overview</p>
        <h2 className="font-display font-bold text-xl text-ink">Admin Dashboard</h2>
      </motion.div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-[60fr_40fr] gap-5">
        <ChartSkeleton className="h-56" />
        <ChartSkeleton className="h-56" />
      </div>

      {/* Recent orders + Low stock */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-paper rounded-2xl border border-line p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm text-ink">Recent orders</p>
            <a href="/admin/orders" className="text-xs text-petrol hover:underline">View all</a>
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}
          </div>
        </div>

        <div className="bg-paper rounded-2xl border border-line p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm text-ink">Low stock alerts</p>
            <a href="/admin/inventory" className="text-xs text-petrol hover:underline">View all</a>
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
