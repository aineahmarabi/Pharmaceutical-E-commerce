'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { toProduct } from '@/lib/adapters/product';
import { ProductGrid } from '@/components/product/ProductGrid';
import { useWishlistStore } from '@/store/cart';
import { AccountFrame } from '../AccountFrame';

export default function WishlistPage() {
  const { ids } = useWishlistStore();
  const idList = Array.from(ids) as Id<'products'>[];
  const products = useQuery(api.products.listByIds, { ids: idList });

  return (
    <AccountFrame title="Wishlist" description={idList.length ? `${idList.length} saved ${idList.length === 1 ? 'product' : 'products'}` : undefined}>
      {idList.length === 0 ? (
        <ProductGrid products={[]} emptyTitle="Your wishlist is empty" emptyDescription="" />
      ) : (
        <ProductGrid products={products?.map(toProduct)} skeletonCount={idList.length} />
      )}
    </AccountFrame>
  );
}
