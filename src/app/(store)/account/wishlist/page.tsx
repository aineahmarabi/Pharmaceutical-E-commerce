'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { toProduct } from '@/lib/adapters/product';
import { ProductGrid } from '@/components/product/ProductGrid';
import { useWishlistStore } from '@/store/cart';

const ease = [0.16, 1, 0.3, 1] as const;

export default function WishlistPage() {
  const { ids } = useWishlistStore();
  const idList = Array.from(ids) as Id<'products'>[];
  const products = useQuery(api.products.listByIds, { ids: idList });

  return (
    <div className="min-h-screen bg-porcelain py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          <nav className="text-xs text-petrol-300 mb-3 flex gap-2">
            <Link href="/account" className="hover:text-petrol">Account</Link><span>/</span><span className="text-ink/70">Wishlist</span>
          </nav>
          <h1 className="font-display font-bold text-2xl text-ink tracking-tight flex items-center gap-2">
            <Heart size={20} className="text-signal" />Wishlist
          </h1>
        </motion.div>

        <div className="mt-6">
          {idList.length === 0 ? (
            <ProductGrid products={[]} emptyTitle="Your wishlist is empty" emptyDescription="Save products you're interested in by tapping the heart icon." />
          ) : (
            <ProductGrid products={products?.map(toProduct)} skeletonCount={idList.length} />
          )}
        </div>
      </div>
    </div>
  );
}
