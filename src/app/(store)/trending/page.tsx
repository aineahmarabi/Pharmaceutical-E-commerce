'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toProduct } from '@/lib/adapters/product';
import { ListingView } from '@/components/product/ListingView';

export default function TrendingPage() {
  const products = useQuery(api.products.listTrending, { limit: 24 });

  return (
    <ListingView
      breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Trending now' }]}
      title="Trending now"
      products={products?.map(toProduct)}
      emptyTitle="Nothing trending yet"
      emptyDescription="Check back soon."
    />
  );
}
