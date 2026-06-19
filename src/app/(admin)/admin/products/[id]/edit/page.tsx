'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

const ease = [0.16, 1, 0.3, 1] as const;

export default function AdminEditProductPage() {
  return (
    <div className="p-4 sm:p-6 max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }}>
        <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-petrol hover:text-petrol/80 mb-4">
          <ArrowLeft size={14} />Back to products
        </Link>
        <Skeleton className="h-6 w-48" />
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Form fields skeleton */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
        <div className="sm:col-span-2 space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>

      <div className="flex gap-3">
        <Skeleton className="h-10 w-28 rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
    </div>
  );
}
