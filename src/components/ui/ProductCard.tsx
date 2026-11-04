'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OutOfStockMark } from '@/components/ui/OutOfStockMark';
import { ProductImagePlaceholder } from './ProductImagePlaceholder';
import { ClassBadge } from './ClassBadge';
import { useCartStore, useWishlistStore } from '@/store/cart';
import { useToast } from './Toast';
import { flyToCart, productImageNear } from '@/lib/flyToCart';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/fixtures/types';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toggle, has } = useWishlistStore();
  const { toast } = useToast();
  const [justAdded, setJustAdded] = useState(false);
  const wishlisted = has(product.id);
    const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.inStock || justAdded) return;
    const near = productImageNear(e.currentTarget as Element);
    flyToCart(near.el, { imageUrl: near.url, initials: product.name.trim().slice(0, 2).toUpperCase() });
    addItem(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle(product.id);
    toast(wishlisted ? 'Removed from wishlist' : `Saved: ${product.name}`, wishlisted ? 'info' : 'success');
  };

  const handleNotify = (e: React.MouseEvent) => {
    e.preventDefault();
    toast('We will notify you', 'info');
  };

  return (
    <article className={cn('group relative flex flex-col bg-paper rounded-lg border border-line overflow-hidden', className)}>
      <Link
        href={`/products/${product.slug}`}
        className="flex flex-col flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40 rounded-lg"
      >
        <div className="relative border-b border-line">
          <ProductImagePlaceholder
            framed
            aspectRatio="aspect-square"
            name={product.name}
            categorySlug={product.categorySlug}
            imageUrl={product.imageUrl}
          />
          {product.classification !== 'OTC' && product.inStock && (
            <ClassBadge classification={product.classification} className="absolute bottom-1.5 left-1.5 bg-paper" />
          )}
          {!product.inStock && <OutOfStockMark />}
        </div>

        <div className="flex flex-col flex-1 px-2.5 pt-2.5 pb-1">
          <h3 className="text-sm font-medium text-ink leading-snug line-clamp-2 h-9">{product.name}</h3>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
            <span className="text-sm font-semibold tabular-nums text-ink">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </Link>

      <div className="px-2.5 pb-2.5 pt-1.5 flex items-center gap-1.5">
        {product.inStock ? (
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 h-8 rounded-md bg-petrol hover:bg-petrol-700 text-white text-sm font-medium transition-transform duration-100 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40 focus-visible:ring-offset-2 touch-manipulation"
            aria-live="polite"
          >
            {justAdded ? 'Added' : 'Add'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNotify}
            className="flex-1 h-8 rounded-md border border-line bg-paper hover:bg-porcelain text-ink text-sm font-medium transition-transform duration-100 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40"
          >
            Notify me
          </button>
        )}
        <button
          type="button"
          onClick={handleWishlist}
          aria-pressed={wishlisted}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="h-8 w-8 shrink-0 rounded-md border border-line bg-paper text-ink hover:bg-porcelain flex items-center justify-center transition-transform duration-100 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40"
        >
          <Heart size={14} className={wishlisted ? 'text-signal' : undefined} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>
    </article>
  );
}
