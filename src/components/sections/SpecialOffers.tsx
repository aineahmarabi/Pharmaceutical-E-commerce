'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';

const ease = [0.16, 1, 0.3, 1] as const;

export function SpecialOffers() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-amber/5">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="flex items-center gap-3 mb-8"
        >
          <Flame size={22} className="text-signal" />
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-petrol-300 mb-0.5">Limited time</p>
            <h2 className="font-display font-bold text-2xl text-ink tracking-tight">Special Offers</h2>
          </div>
        </motion.div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-52">
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
