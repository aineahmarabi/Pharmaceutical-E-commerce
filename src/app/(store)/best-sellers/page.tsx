'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toProduct } from '@/lib/adapters/product';
import { ListingView } from '@/components/product/ListingView';

export default function BestSellersPage() {
  const products = useQuery(api.products.listBestSellers, { limit: 24 });

  return (
    <ListingView
      breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Best sellers' }]}
      title="Best sellers"
      products={products?.map(toProduct)}
      emptyTitle="No best sellers yet"
      emptyDescription="Check back soon."
    />
  );
}
