'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Zap, Check, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ProductImagePlaceholder } from './ProductImagePlaceholder';
import { ClassBadge } from './ClassBadge';
import { StarRating } from './StarRating';
import { useCartStore, useWishlistStore } from '@/store/cart';
import { useToast } from './Toast';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/fixtures/types';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const router = useRouter();
  const { addItem, closeCart } = useCartStore();
  const { toggle, has } = useWishlistStore();
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const wishlisted = has(product.id);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.classification === 'POM' || !product.inStock || adding || justAdded) return;
    setAdding(true);
    await new Promise((r) => setTimeout(r, 320));
    addItem(product);
    setAdding(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1100);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.inStock) return;
    addItem(product);
    closeCart();
    router.push('/checkout');
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
        className="relative block bg-paper rounded-2xl border border-line overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40"
      >
        {/* Image */}
        <div className="relative overflow-hidden">
          <ProductImagePlaceholder aspectRatio="aspect-[4/3]" name={product.name} categorySlug={product.categorySlug} imageUrl={product.imageUrl} />

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
        <div className="p-3">
          <p className="font-body text-[11px] text-petrol-300 uppercase tracking-wide truncate">{product.brand}</p>
          <h3 className="font-body font-semibold text-xs text-ink leading-snug line-clamp-2 mt-0.5 group-hover:text-petrol transition-colors">
            {product.name}
          </h3>
          {product.rating ? (
            <StarRating rating={product.rating} reviewCount={product.reviewCount} className="mt-1" />
          ) : (
            <p className="font-mono text-[11px] text-petrol-300 mt-1">
              {product.strength} · {product.packSize}
            </p>
          )}
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="font-mono font-semibold text-sm text-ink">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="font-mono text-[11px] text-petrol-300 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Quick-action bar (slides up on hover) */}
        {product.inStock && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out flex">
            <button
              type="button"
              onClick={handleAdd}
              disabled={adding || justAdded}
              className="relative flex-1 flex items-center justify-center gap-1.5 bg-petrol hover:bg-petrol-700 text-paper text-xs font-semibold py-3 transition-colors disabled:opacity-100 overflow-hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                {adding ? (
                  <motion.span key="spinner" exit={{ opacity: 0 }} className="w-4 h-4 border-2 border-paper/30 border-t-paper rounded-full animate-spin" />
                ) : justAdded ? (
                  <motion.span key="dropped" className="flex items-center gap-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <span className="relative w-4 h-4 flex items-center justify-center">
                      <motion.span
                        initial={{ y: -14, opacity: 0, rotate: -15 }}
                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 14 }}
                        className="absolute"
                      >
                        <Package size={14} />
                      </motion.span>
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.35, type: 'spring', stiffness: 400, damping: 12 }}
                        className="absolute -bottom-0.5 -right-0.5 bg-success rounded-full w-2.5 h-2.5 flex items-center justify-center"
                      >
                        <Check size={7} className="text-paper" strokeWidth={4} />
                      </motion.span>
                    </span>
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                      Added to cart
                    </motion.span>
                  </motion.span>
                ) : (
                  <motion.span key="idle" className="flex items-center gap-1.5" exit={{ opacity: 0 }}>
                    <ShoppingCart size={14} />
                    Add to cart
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="flex-1 flex items-center justify-center gap-1.5 bg-signal hover:bg-signal/90 text-paper text-xs font-semibold py-3 transition-colors border-l border-paper/20"
            >
              <Zap size={14} />
              Buy now
            </button>
          </div>
        )}
      </Link>
    </div>
  );
}
