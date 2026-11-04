'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { toProduct } from '@/lib/adapters/product';
import { useCustomerAuth } from '@/lib/auth/customerAuth';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SectionHeader } from '@/components/sections/SectionHeader';

/** Products from the signed-in customer's past orders. Renders nothing for guests or first-time customers. */
export function BuyAgain() {
  const { token, isAuthenticated } = useCustomerAuth();
  const products = useQuery(api.orders.myBuyAgainProducts, isAuthenticated && token ? { token, limit: 5 } : 'skip');
  if (!isAuthenticated || !products || products.length === 0) return null;

  return (
    <section aria-label="Buy again">
      <SectionHeader title="Buy again" href="/account/orders" linkLabel="Orders" />
      <ProductGrid products={products.map(toProduct)} columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" />
    </section>
  );
}
