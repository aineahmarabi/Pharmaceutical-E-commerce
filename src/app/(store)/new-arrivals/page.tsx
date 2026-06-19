'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';

const ease = [0.16, 1, 0.3, 1] as const;

export default function NewArrivalsPage() {
  return (
    <div className="min-h-screen bg-porcelain">
      <div className="bg-petrol py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }} className="flex items-center gap-3">
            <Sparkles size={26} className="text-petrol-300" />
            <div>
              <h1 className="font-display font-extrabold text-3xl text-paper tracking-tight">New Arrivals</h1>
              <p className="text-paper/50 text-sm mt-0.5">Just landed — freshly stocked products</p>
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
