'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { brands } from '@/lib/fixtures/categories';

const ease = [0.16, 1, 0.3, 1] as const;

export function BrandsRail() {
  const doubled = [...brands, ...brands];

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 bg-paper overflow-hidden">
      <div className="max-w-7xl mx-auto mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
        >
          <p className="font-mono text-xs uppercase tracking-widest text-petrol-300 mb-1">Our Brands</p>
          <h2 className="font-display font-bold text-2xl text-ink tracking-tight">Trusted names</h2>
        </motion.div>
      </div>

      <div className="overflow-hidden">
        <div className="flex brand-rail" style={{ width: 'max-content' }}>
          {doubled.map((brand, i) => (
            <div
              key={`${brand.slug}-${i}`}
              className="flex-shrink-0 mx-2 px-5 py-2.5 bg-paper border border-line rounded-full text-sm font-medium text-ink/60 hover:text-ink hover:border-petrol transition-colors cursor-pointer"
            >
              {brand.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
