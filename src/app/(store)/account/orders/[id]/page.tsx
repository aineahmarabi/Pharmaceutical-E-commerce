'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Skeleton, RowSkeleton } from '@/components/ui/Skeleton';

const ease = [0.16, 1, 0.3, 1] as const;

export default function OrderDetailPage() {
  return (
    <div className="min-h-screen bg-porcelain py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-sm text-petrol hover:text-petrol/80 mb-4">
            <ArrowLeft size={14} />My orders
          </Link>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </motion.div>

        {/* Progress tracker */}
        <div className="bg-paper rounded-2xl border border-line p-5">
          <Skeleton className="h-3 w-28 mb-5" />
          <div className="flex justify-between gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-2.5 w-12" />
              </div>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="bg-paper rounded-2xl border border-line p-5">
          <Skeleton className="h-4 w-20 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)}
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

        {/* Delivery info */}
        <div className="bg-paper rounded-2xl border border-line p-5">
          <Skeleton className="h-4 w-36 mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-3 w-3/4" />)}
          </div>
        </div>
      </div>
    </div>
  );
}
