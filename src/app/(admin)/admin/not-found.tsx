'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { SearchX, LayoutDashboard } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-5">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="flex flex-col items-center"
      >
        <div className="relative w-16 h-16 rounded-2xl bg-p-bg-surface border border-p-border-subdued flex items-center justify-center mb-5">
          <SearchX size={26} className="text-p-text-disabled" />
          <div className="absolute -top-2 -right-2 h-6 min-w-6 px-1.5 rounded-full bg-p-primary text-white flex items-center justify-center font-mono text-[11px] font-bold">
            404
          </div>
        </div>
        <h1 className="text-lg font-semibold text-p-text">Page not found</h1>
        <p className="text-sm text-p-text-subdued mt-1.5 max-w-[360px]">
          This admin page doesn't exist, or it may have moved. Check the URL or head back to the dashboard.
        </p>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 mt-6 h-9 px-4 rounded-md text-sm font-semibold bg-p-primary text-white shadow-[0_1px_0_rgba(0,0,0,0.05)] hover:bg-p-primary-hover transition-colors"
        >
          <LayoutDashboard size={14} /> Back to dashboard
        </Link>
      </motion.div>
    </div>
  );
}
