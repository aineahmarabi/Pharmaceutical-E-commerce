'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Monitor, ShoppingCart } from 'lucide-react';
import { ProductCardSkeleton, Skeleton } from '@/components/ui/Skeleton';

const ease = [0.16, 1, 0.3, 1] as const;

export default function AdminPOSPage() {
  return (
    <div className="p-4 sm:p-6 h-full">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }} className="mb-5">
        <p className="text-petrol-300 text-sm">Operations</p>
        <h2 className="font-display font-bold text-xl text-ink flex items-center gap-2">
          <Monitor size={18} className="text-petrol" />POS Terminal
        </h2>
      </motion.div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-5 h-[calc(100%-60px)]">
        {/* Product grid */}
        <div className="bg-paper rounded-2xl border border-line p-4 overflow-y-auto">
          <div className="relative mb-4">
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        </div>

        {/* Cart panel */}
        <div className="bg-paper rounded-2xl border border-line p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart size={16} className="text-petrol" />
            <p className="font-semibold text-sm text-ink">Current Sale</p>
          </div>
          <div className="flex-1 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
          </div>
          <div className="border-t border-line mt-4 pt-4 space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
          <Skeleton className="h-11 w-full rounded-xl mt-4" />
        </div>
      </div>
    </div>
  );
}
