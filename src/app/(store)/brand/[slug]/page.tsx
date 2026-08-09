'use client';

import React, { use } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { toProduct } from '@/lib/adapters/product';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

const ease = [0.16, 1, 0.3, 1] as const;

function titleize(slug: string) {
  return slug.split('-').map((w) => w[0]?.toUpperCase() + w.slice(1)).join(' ');
}

export default function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const products = useQuery(api.products.listByBrand, { brandSlug: slug, limit: 48 });
  const heading = products?.[0]?.brand ?? titleize(slug);

  return (
    <div className="min-h-screen bg-porcelain">
      <div className="bg-ink py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
            <Breadcrumb dark className="mb-3" items={[{ label: 'Home', href: '/' }, { label: 'Brand' }, { label: heading }]} />
            <p className="font-mono text-xs uppercase tracking-widest text-petrol-300 mb-1">Brand</p>
            <h1 className="font-display font-extrabold text-3xl text-paper tracking-tight">{heading}</h1>
          </motion.div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductGrid
          products={products?.map(toProduct)}
          emptyTitle="No products from this brand yet"
          emptyDescription="Check back soon or browse another brand."
        />
      </div>
    </div>
  );
}
