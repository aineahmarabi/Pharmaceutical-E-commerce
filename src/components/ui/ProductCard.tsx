'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ProductImagePlaceholder } from './ProductImagePlaceholder';
import { ClassBadge } from './ClassBadge';
import { useCartStore, useWishlistStore } from '@/store/cart';
import { useToast } from './Toast';
import type { Product } from '@/lib/fixtures/types';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toggle, has } = useWishlistStore();
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const wishlisted = has(product.id);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.classification === 'POM' || !product.inStock || adding) return;
    setAdding(true);
    await new Promise((r) => setTimeout(r, 320));
    addItem(product);
    toast(`Added — ${product.name}`, 'success');
    setAdding(false);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle(product.id);
    toast(wishlisted ? 'Removed from wishlist' : `Saved — ${product.name}`, wishlisted ? 'info' : 'success');
  };

  return (
    <div className={cn('group relative product-card-hover', className)}>
      <Link
        href={`/products/${product.slug}`}
        className="block bg-paper rounded-2xl border border-line overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40"
      >
        {/* Image */}
        <div className="relative overflow-hidden">
          <ProductImagePlaceholder aspectRatio="aspect-[4/3]" />

          {/* Badges top-left */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            <ClassBadge classification={product.classification} />
            {product.isNew && (
              <span className="bg-info/10 text-info border border-info/20 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase">New</span>
            )}
            {product.isOffer && product.compareAtPrice && (
              <span className="bg-signal/10 text-signal border border-signal/20 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase">Sale</span>
            )}
          </div>

          {/* Wishlist */}
          <button
            type="button"
            onClick={handleWishlist}
            className={cn(
              'absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors',
              wishlisted ? 'bg-signal text-paper' : 'bg-paper/90 text-ink hover:bg-signal hover:text-paper'
            )}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={13} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>

          {/* Out of stock */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-ink/25 flex items-center justify-center">
              <span className="bg-paper/95 text-ink text-xs font-semibold px-3 py-1.5 rounded-full">Out of stock</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="font-body text-xs text-petrol-300 uppercase tracking-wide truncate">{product.brand}</p>
          <h3 className="font-body font-semibold text-sm text-ink leading-snug line-clamp-2 mt-0.5 group-hover:text-petrol transition-colors">
            {product.name}
          </h3>
          <p className="font-mono text-xs text-petrol-300 mt-1">
            {product.strength} · {product.packSize}
          </p>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-mono font-semibold text-lg text-ink">
              KES {product.price.toLocaleString()}
            </span>
            {product.compareAtPrice && (
              <span className="font-mono text-xs text-petrol-300 line-through">
                KES {product.compareAtPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Quick-action bar (slides up on hover) */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out">
          {product.classification === 'POM' ? (
            <div className="bg-amber/5 border-t border-amber/20 px-4 py-2.5 text-center">
              <span className="text-xs font-medium text-amber">Prescription required</span>
            </div>
          ) : product.inStock ? (
            <button
              type="button"
              onClick={handleAdd}
              disabled={adding}
              className="w-full flex items-center justify-center gap-2 bg-petrol hover:bg-petrol-700 text-paper text-sm font-semibold py-3 transition-colors disabled:opacity-60"
            >
              {adding ? (
                <span className="w-4 h-4 border-2 border-paper/30 border-t-paper rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingCart size={15} />
                  Add to cart
                </>
              )}
            </button>
          ) : null}
        </div>
      </Link>
    </div>
  );
}
