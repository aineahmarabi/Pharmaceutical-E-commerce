'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, ShieldCheck, Truck, Zap } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { toProduct } from '@/lib/adapters/product';
import { ProductImagePlaceholder } from '@/components/ui/ProductImagePlaceholder';
import { ProductCardSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { ClassBadge } from '@/components/ui/ClassBadge';
import { StarRating } from '@/components/ui/StarRating';
import { StarRatingInput } from '@/components/ui/StarRatingInput';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCartStore, useWishlistStore } from '@/store/cart';
import { useToast } from '@/components/ui/Toast';
import { cn, formatPrice } from '@/lib/utils';

const ease = [0.16, 1, 0.3, 1] as const;
const tabs = ['Description', 'Directions & Warnings', 'Reviews'] as const;

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const doc = useQuery(api.products.getBySlug, { slug });

  if (doc === undefined) return <ProductDetailSkeleton />;
  if (doc === null) {
    return (
      <div className="min-h-screen bg-porcelain flex items-center justify-center">
        <EmptyState
          title="Product not found"
          description="This product may have been removed or is no longer available."
          action={<Link href="/products" className="text-petrol text-sm font-medium hover:underline">Browse all products</Link>}
        />
      </div>
    );
  }

  return <ProductDetailContent product={toProduct(doc)} />;
}

function ProductDetailContent({ product }: { product: ReturnType<typeof toProduct> }) {
  const router = useRouter();
  const { addItem, closeCart } = useCartStore();
  const { toggle, has } = useWishlistStore();
  const { toast } = useToast();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState<typeof tabs[number]>('Description');
  const wishlisted = has(product.id);

  const related = useQuery(api.products.listByCategory, { categorySlug: product.categorySlug, limit: 8 });
  const relatedFiltered = related?.map(toProduct).filter((p) => p.id !== product.id).slice(0, 5);

  const handleAdd = async () => {
    if (!product.inStock || adding) return;
    setAdding(true);
    await new Promise((r) => setTimeout(r, 320));
    addItem(product, qty);
    toast(`Added ${qty} × ${product.name}`, 'success');
    setAdding(false);
  };

  const handleBuyNow = () => {
    if (!product.inStock) return;
    addItem(product, qty);
    closeCart();
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-porcelain">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          className="mb-6"
          items={[
            { label: 'Home', href: '/' },
            { label: product.category, href: `/category/${product.categorySlug}` },
            { label: product.name },
          ]}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className="grid md:grid-cols-[38fr_62fr] gap-8 bg-paper rounded-2xl border border-line p-6 sm:p-8"
        >
          <div>
            <div className="max-w-[240px] mx-auto md:mx-0 border border-line rounded-xl p-4 bg-porcelain">
              <ProductImagePlaceholder
                aspectRatio="aspect-[4/3]"
                className="rounded-lg"
                size="sm"
                name={product.name}
                categorySlug={product.categorySlug}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ClassBadge classification={product.classification} />
              {product.isNew && <span className="bg-info/10 text-info border border-info/20 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase">New</span>}
              {product.isOffer && product.compareAtPrice && <span className="bg-signal/10 text-signal border border-signal/20 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase">Sale</span>}
            </div>

            <div>
              <p className="text-xs text-petrol-300 uppercase tracking-wide">{product.brand}{product.manufacturer ? ` · ${product.manufacturer}` : ''}</p>
              <h1 className="font-display font-bold text-2xl text-ink tracking-tight mt-1">{product.name}</h1>
            </div>

            <StarRating rating={product.rating} reviewCount={product.reviewCount} size={14} />

            <p className="font-mono text-sm text-petrol-300">
              {product.genericName && `${product.genericName} · `}{product.strength} · {product.packSize}
            </p>

            <div className="flex items-baseline gap-3">
              <span className="font-mono font-bold text-3xl text-ink">{formatPrice(product.price)}</span>
              {product.compareAtPrice && (
                <span className="font-mono text-base text-petrol-300 line-through">{formatPrice(product.compareAtPrice)}</span>
              )}
            </div>

            {!product.inStock && (
              <p className="text-sm font-medium text-danger">Out of stock</p>
            )}

            <div className="flex items-center gap-3">
              <QuantityStepper value={qty} onChange={setQty} />
              <button
                type="button"
                onClick={() => { toggle(product.id); toast(wishlisted ? 'Removed from wishlist' : `Saved — ${product.name}`, wishlisted ? 'info' : 'success'); }}
                className={cn('w-11 h-11 flex-shrink-0 rounded-xl flex items-center justify-center border transition-colors ml-auto', wishlisted ? 'bg-signal border-signal text-paper' : 'border-line text-ink hover:border-signal hover:text-signal')}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAdd}
                disabled={!product.inStock || adding}
                className="flex-1 flex items-center justify-center gap-2 bg-petrol hover:bg-petrol-700 text-paper text-sm font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
              >
                {adding ? (
                  <span className="w-4 h-4 border-2 border-paper/30 border-t-paper rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart size={16} />
                    Add to cart
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="flex-1 flex items-center justify-center gap-2 bg-signal hover:bg-signal/90 text-paper text-sm font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
              >
                <Zap size={16} />
                Buy now
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-petrol-300 pt-1">
              <Truck size={13} />
              Same-day delivery available in Nairobi
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease }}
          className="mt-8 bg-paper rounded-2xl border border-line p-6"
        >
          <div className="flex gap-6 border-b border-line pb-3 mb-5 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'text-sm font-medium whitespace-nowrap pb-2 border-b-2 transition-colors -mb-3',
                  tab === t ? 'text-petrol border-petrol' : 'text-petrol-300 border-transparent hover:text-ink'
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'Description' && (
            <div className="max-w-3xl text-sm text-ink leading-relaxed space-y-3">
              <p>{product.description}</p>
              {product.ingredients && (
                <p><span className="font-semibold">Ingredients: </span>{product.ingredients}</p>
              )}
            </div>
          )}

          {tab === 'Directions & Warnings' && (
            <div className="max-w-3xl text-sm text-ink leading-relaxed space-y-4">
              <div>
                <p className="font-semibold mb-1">Directions</p>
                <p className="text-petrol-300">{product.directions}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Warnings</p>
                <p className="text-petrol-300">{product.warnings}</p>
              </div>
            </div>
          )}

          {tab === 'Reviews' && <ReviewsPanel productId={product.id as Id<'products'>} rating={product.rating} reviewCount={product.reviewCount} />}
        </motion.div>

        {/* Related */}
        {relatedFiltered && relatedFiltered.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display font-bold text-xl text-ink mb-5">
              {product.classification === 'POM' ? 'Similar prescription medicines' : 'Related medicines'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {relatedFiltered.map((p) => (
                <Link key={p.id} href={`/products/${p.slug}`} className="block">
                  <div className="bg-paper rounded-2xl border border-line overflow-hidden product-card-hover">
                    <ProductImagePlaceholder aspectRatio="aspect-[4/3]" name={p.name} categorySlug={p.categorySlug} />
                    <div className="p-3">
                      <p className="text-xs text-petrol-300 truncate">{p.brand}</p>
                      <p className="text-sm font-medium text-ink line-clamp-2 leading-snug mt-0.5">{p.name}</p>
                      <p className="font-mono font-semibold text-sm text-ink mt-1.5">{formatPrice(p.price)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewsPanel({ productId, rating, reviewCount }: { productId: Id<'products'>; rating?: number; reviewCount?: number }) {
  const { toast } = useToast();
  const reviews = useQuery(api.reviews.listByProduct, { productId });
  const submitReview = useMutation(api.reviews.submitReview);

  const [showForm, setShowForm] = useState(false);
  const [stars, setStars] = useState(0);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stars === 0) {
      toast('Please select a star rating', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await submitReview({ productId, customerName: name, rating: stars, comment: comment || undefined });
      toast('Thanks for your review!', 'success');
      setShowForm(false);
      setStars(0);
      setName('');
      setComment('');
    } catch (err) {
      console.error(err);
      toast('Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      {rating ? (
        <div className="flex items-center gap-4 mb-6">
          <span className="font-display font-bold text-3xl text-ink">{rating.toFixed(1)}</span>
          <div>
            <StarRating rating={rating} size={16} />
            <p className="text-xs text-petrol-300 mt-1">Based on {reviewCount ?? 0} review{reviewCount === 1 ? '' : 's'}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-petrol-300 mb-6">No reviews yet — be the first to share your experience.</p>
      )}

      {reviews && reviews.length > 0 && (
        <div className="space-y-4 mb-6">
          {reviews.map((r) => (
            <div key={r._id} className="border-b border-line/50 pb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm text-ink">{r.customerName}</span>
                <StarRating rating={r.rating} size={12} />
              </div>
              {r.comment && <p className="text-sm text-petrol-300">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <form onSubmit={handleSubmit} className="bg-porcelain rounded-xl p-4 space-y-3">
          <div>
            <p className="text-xs font-medium text-petrol-300 mb-1.5">Your rating</p>
            <StarRatingInput value={stars} onChange={setStars} />
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full bg-paper border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-petrol-300/50 focus:outline-none focus:border-petrol transition-colors"
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Share your experience (optional)"
            className="w-full bg-paper border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-petrol-300/50 focus:outline-none focus:border-petrol transition-colors resize-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-petrol hover:bg-petrol-700 text-paper text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Submit review'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-petrol-300 text-sm font-medium px-3 hover:text-ink transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="text-petrol text-sm font-semibold hover:underline"
        >
          Write a review
        </button>
      )}
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-porcelain">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 mb-6">
          <Skeleton className="h-3 w-12" /><Skeleton className="h-3 w-3" /><Skeleton className="h-3 w-20" /><Skeleton className="h-3 w-3" /><Skeleton className="h-3 w-32" />
        </div>
        <div className="grid md:grid-cols-[38fr_62fr] gap-8 bg-paper rounded-2xl border border-line p-6 sm:p-8">
          <div className="max-w-[240px] mx-auto md:mx-0 border border-line rounded-xl p-4">
            <Skeleton className="aspect-[4/3] rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
        <div className="mt-10">
          <Skeleton className="h-6 w-40 mb-5" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
