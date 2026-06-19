'use client';

import React, { use } from 'react';
import { motion } from 'framer-motion';
import { ProductCardSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { categories } from '@/lib/fixtures/categories';

const ease = [0.16, 1, 0.3, 1] as const;

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const category = categories.find((c) => c.slug === slug);

  return (
    <div className="min-h-screen bg-porcelain">
      <div className="bg-petrol py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }}>
            <p className="font-mono text-xs uppercase tracking-widest text-petrol-300 mb-1">Category</p>
            <h1 className="font-display font-extrabold text-3xl text-paper tracking-tight">{category?.name ?? slug}</h1>
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
