'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toProduct } from '@/lib/adapters/product';
import { ListingView } from '@/components/product/ListingView';

export default function NewArrivalsPage() {
  const products = useQuery(api.products.listNewArrivals, { limit: 24 });

  return (
    <ListingView
      breadcrumb={[{ label: 'Home', href: '/' }, { label: 'New arrivals' }]}
      title="New arrivals"
      products={products?.map(toProduct)}
      emptyTitle="No new arrivals right now"
      emptyDescription="Check back soon."
    />
  );
}
