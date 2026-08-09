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
  columns?: string;
  className?: string;
}

export function ProductGrid({
  products,
  skeletonCount = 12,
  emptyTitle = 'No products found',
  emptyDescription = 'Try a different filter or check back soon.',
  columns = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  className,
}: ProductGridProps) {
  if (products === undefined) {
    return (
      <div className={cn('grid gap-4', columns, className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className={cn('grid gap-4', columns, className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
