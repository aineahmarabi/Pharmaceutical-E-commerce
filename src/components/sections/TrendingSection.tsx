'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { toProduct } from '@/lib/adapters/product';
import { ProductGrid } from '@/components/product/ProductGrid';

const ease = [0.16, 1, 0.3, 1] as const;
const tabs = ['Trending', 'Best Sellers', 'New Arrivals'] as const;

export function TrendingSection() {
  const [active, setActive] = useState<typeof tabs[number]>('Trending');

  const trending = useQuery(api.products.listTrending, { limit: 8 });
  const bestSellers = useQuery(api.products.listBestSellers, { limit: 8 });
  const newArrivals = useQuery(api.products.listNewArrivals, { limit: 8 });

  const products = active === 'Trending' ? trending : active === 'Best Sellers' ? bestSellers : newArrivals;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-porcelain">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-petrol-300 mb-1">Popular right now</p>
            <h2 className="font-display font-bold text-2xl text-ink tracking-tight flex items-center gap-2">
              <TrendingUp size={22} className="text-signal" />Products
            </h2>
          </div>
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${active === tab ? 'bg-petrol text-paper' : 'bg-paper border border-line text-petrol-300 hover:text-ink'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        <ProductGrid
          products={products?.map(toProduct)}
          skeletonCount={8}
          emptyTitle="Nothing here yet"
          emptyDescription="Check back soon."
        />
      </div>
    </section>
  );
}
