'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Skeleton, RowSkeleton } from '@/components/ui/Skeleton';

const ease = [0.16, 1, 0.3, 1] as const;

export default function AdminOrderDetailPage() {
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }}>
        <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-petrol hover:text-petrol/80 mb-4">
          <ArrowLeft size={14} />Back to orders
        </Link>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-36" />
          </div>
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-paper rounded-2xl border border-line p-5 space-y-2">
          <Skeleton className="h-3 w-24 mb-3" />
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-3 w-full" />)}
        </div>
        <div className="bg-paper rounded-2xl border border-line p-5 space-y-2">
          <Skeleton className="h-3 w-24 mb-3" />
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-3 w-full" />)}
        </div>
      </div>

      <div className="bg-paper rounded-2xl border border-line p-5">
        <Skeleton className="h-4 w-20 mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}
        </div>
        <div className="border-t border-line mt-4 pt-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-paper rounded-2xl border border-line p-5">
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
