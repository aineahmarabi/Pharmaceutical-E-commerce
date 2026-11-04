'use client';

import React, { use } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { toProduct } from '@/lib/adapters/product';
import { ListingView } from '@/components/product/ListingView';

function titleize(slug: string) {
  return slug.split('-').map((w) => w[0]?.toUpperCase() + w.slice(1)).join(' ');
}

export default function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const products = useQuery(api.products.listByBrand, { brandSlug: slug, limit: 48 });
  const heading = products?.[0]?.brand ?? titleize(slug);

  return (
    <ListingView
      breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Brands', href: '/products' }, { label: heading }]}
      title={heading}
      products={products?.map(toProduct)}
      hideBrandFilter
      emptyTitle="No products from this brand yet"
      emptyDescription="Try another brand."
    />
  );
}
