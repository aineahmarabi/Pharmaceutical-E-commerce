'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';

const ease = [0.16, 1, 0.3, 1] as const;

function SearchContent() {
  const params = useSearchParams();
  const query = params.get('q') ?? '';

  return (
    <div className="min-h-screen bg-porcelain">
      <div className="bg-ink py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
            <div className="flex items-center gap-3 mb-2">
              <Search size={20} className="text-petrol-300" />
              <h1 className="font-display font-bold text-2xl text-paper tracking-tight">
                {query ? <>Results for <span className="text-signal">&ldquo;{query}&rdquo;</span></> : 'Search'}
              </h1>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return <Suspense fallback={null}><SearchContent /></Suspense>;
}
