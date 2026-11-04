'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { toProduct } from '@/lib/adapters/product';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SectionHeader } from '@/components/sections/SectionHeader';

/** A product shelf titled by need. Hides itself when the category has no stock. */
export function NeedShelf({ title, slug }: { title: string; slug: string }) {
  const products = useQuery(api.products.listByCategory, { categorySlug: slug, limit: 5 });
  if (products && products.length === 0) return null;

  return (
    <section aria-label={title}>
      <SectionHeader title={title} href={`/category/${slug}`} />
      <ProductGrid products={products?.map(toProduct)} skeletonCount={5} columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" />
    </section>
  );
}
