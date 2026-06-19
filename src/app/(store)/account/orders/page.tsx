'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { RowSkeleton } from '@/components/ui/Skeleton';

const ease = [0.16, 1, 0.3, 1] as const;

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-porcelain py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          <nav className="text-xs text-petrol-300 mb-3 flex gap-2">
            <Link href="/account" className="hover:text-petrol">Account</Link><span>/</span><span className="text-ink/70">Orders</span>
          </nav>
          <h1 className="font-display font-bold text-2xl text-ink tracking-tight">My Orders</h1>
        </motion.div>

        <div className="mt-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
}
