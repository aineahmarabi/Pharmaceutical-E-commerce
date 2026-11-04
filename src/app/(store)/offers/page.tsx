'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toProduct } from '@/lib/adapters/product';
import { ListingView } from '@/components/product/ListingView';

export default function OffersPage() {
  const products = useQuery(api.products.listOffers, { limit: 24 });

  return (
    <ListingView
      breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Special offers' }]}
      title="Special offers"
      products={products?.map(toProduct)}
      emptyTitle="No offers right now"
      emptyDescription="Check back soon."
    />
  );
}
