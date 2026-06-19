'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { StatCardSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';

const ease = [0.16, 1, 0.3, 1] as const;

export default function AdminAnalyticsPage() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }}>
        <p className="text-petrol-300 text-sm">Insights</p>
        <h2 className="font-display font-bold text-xl text-ink">Analytics</h2>
      </motion.div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>

      {/* Chart row */}
      <div className="grid lg:grid-cols-2 gap-5">
        <ChartSkeleton className="h-64" />
        <ChartSkeleton className="h-64" />
      </div>

      {/* Second chart row */}
      <div className="grid lg:grid-cols-[60fr_40fr] gap-5">
        <ChartSkeleton className="h-56" />
        <ChartSkeleton className="h-56" />
      </div>
    </div>
  );
}
