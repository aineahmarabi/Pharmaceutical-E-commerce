'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toProduct } from '@/lib/adapters/product';
import { ProductGrid } from '@/components/product/ProductGrid';

const ease = [0.16, 1, 0.3, 1] as const;

export default function BestSellersPage() {
  const products = useQuery(api.products.listBestSellers, { limit: 24 });

  return (
    <div className="min-h-screen bg-porcelain">
      <div className="bg-ink py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }} className="flex items-center gap-3">
            <Award size={26} className="text-signal" />
            <div>
              <h1 className="font-display font-extrabold text-3xl text-paper tracking-tight">Best Sellers</h1>
              <p className="text-paper/50 text-sm mt-0.5">Our most popular products</p>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductGrid
          products={products?.map(toProduct)}
          emptyTitle="No best sellers yet"
          emptyDescription="Check back soon as customers start shopping."
        />
      </div>
    </div>
  );
}
