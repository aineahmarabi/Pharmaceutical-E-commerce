import React from 'react';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/fixtures/types';

interface ProductGridProps {
  products: Product[] | undefined;
  skeletonCount?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  columns?: string;
  className?: string;
}

export function ProductGrid({
  products,
  skeletonCount = 12,
  emptyTitle = 'No products found',
  emptyDescription = 'Try a different filter or check back soon.',
  emptyAction,
  columns = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  className,
}: ProductGridProps) {
  if (products === undefined) {
    return (
      <div className={cn('grid gap-3 sm:gap-4', columns, className)} aria-busy="true">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-paper rounded-xl border border-line">
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      </div>
    );
  }

  return (
    <div className={cn('grid gap-3 sm:gap-4', columns, className)}>
      {/* Available items first; sold-out ones follow, keeping their order. */}
      {[...products].sort((a, b) => Number(b.inStock) - Number(a.inStock)).map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
