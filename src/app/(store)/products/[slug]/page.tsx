'use client';

import { flyToCart, productImageNear } from '@/lib/flyToCart';
import React, { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
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
import { ProductCard } from '@/components/ui/ProductCard';
import { DeliveryArea } from '@/components/cart/DeliveryArea';
import { useCartStore, useWishlistStore } from '@/store/cart';
import { useToast } from '@/components/ui/Toast';
import { useBranding } from '@/hooks/useBranding';
import { branding } from '@/lib/config/branding';
import { cn, formatPrice } from '@/lib/utils';

type ProductT = ReturnType<typeof toProduct>;

const field =
  'w-full bg-paper border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-fg focus:outline-none focus:border-petrol focus:ring-2 focus:ring-petrol/40 transition-colors';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const doc = useQuery(api.products.getBySlug, { slug });

  if (doc === undefined) return <ProductDetailSkeleton />;
  if (doc === null) {
    return (
      <div className="min-h-screen bg-porcelain flex items-center justify-center">
        <EmptyState
          title="Product not found"
          action={<Link href="/products" className="text-petrol text-sm font-medium hover:underline">Browse all products</Link>}
        />
      </div>
    );
  }

  return <ProductDetailContent product={toProduct(doc)} />;
}

function Section({ id, title, children, open }: { id?: string; title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details id={id} open={open} className="group bg-paper rounded-xl border border-line">
      <summary className="flex items-center justify-between cursor-pointer list-none px-4 sm:px-6 py-4 text-sm font-semibold tracking-tight text-ink [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40 rounded-xl">
        {title}
        <span aria-hidden className="text-muted-fg transition-transform duration-100 group-open:rotate-90">&rsaquo;</span>
      </summary>
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">{children}</div>
    </details>
  );
}

function ProductDetailContent({ product }: { product: ProductT }) {
  const router = useRouter();
  const { addItem, closeCart } = useCartStore();
  const { toggle, has } = useWishlistStore();
  const { toast } = useToast();
  const store = useBranding();
  const [qty, setQty] = useState(1);
  const wishlisted = has(product.id);

  const needSlug = product.conditions?.[0];
  const byNeed = useQuery(api.products.listByCondition, needSlug ? { conditionSlug: needSlug, limit: 12 } : 'skip');
  const related = useQuery(api.products.listByCategory, { categorySlug: product.categorySlug, limit: 12 });
  const relatedReady = related !== undefined && (!needSlug || byNeed !== undefined);
  const relatedFiltered = relatedReady
    ? Array.from(
        new Map(
          [...(byNeed ?? []), ...related].map(toProduct).filter((p) => p.id !== product.id).map((p) => [p.id, p] as const)
        ).values()
      ).slice(0, 4)
    : undefined;

  const handleAdd = (e?: { currentTarget: Element }) => {
    if (!product.inStock) return;
    if (e) {
      const near = productImageNear(e.currentTarget);
      flyToCart(near.el, { imageUrl: near.url, initials: product.name.trim().slice(0, 2).toUpperCase() });
    }
    addItem(product, qty);
    toast(`Added ${qty} × ${product.name}`, 'success');
  };

  const handleBuyNow = () => {
    if (!product.inStock) return;
    addItem(product, qty);
    closeCart();
    router.push('/checkout');
  };

  const handleWishlist = () => {
    toggle(product.id);
    toast(wishlisted ? 'Removed from wishlist' : `Saved — ${product.name}`, wishlisted ? 'info' : 'success');
  };

  const lowStock = product.inStock && product.stockQty > 0 && product.stockQty <= 10;
  const isRx = product.classification === 'POM';
  const waMessage = encodeURIComponent(`Hello, I'd like to order ${product.name}${product.strength ? ` ${product.strength}` : ''}. I have a prescription.`);
  const waHref = `https://wa.me/${String(store.whatsapp).replace(/\D/g, '')}?text=${waMessage}`;
  const askHref = `https://wa.me/${String(store.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent(`Hello, I have a question about ${product.name}${product.strength ? ` ${product.strength}` : ''}.`)}`;

  const specs: [string, string | undefined][] = [
    ['Generic name', product.genericName],
    ['Strength', product.strength],
    ['Pack size', product.packSize],
    ['Form', product.form],
    ['Manufacturer', product.manufacturer],
    ['SKU', product.sku],
  ];
  const visibleSpecs = specs.filter(([, v]) => !!v && v.trim() !== '');

  return (
    <div className="min-h-screen bg-porcelain pb-40 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: product.category, href: `/category/${product.categorySlug}` },
            { label: product.name },
          ]}
        />

        <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-4 items-start">
          {/* Left column */}
          <div className="space-y-4 min-w-0">
            <div className="bg-paper rounded-xl border border-line p-4 sm:p-6 grid md:grid-cols-[minmax(0,360px)_1fr] gap-6">
              {/* Gallery: always on white */}
              <div className="rounded-lg border border-line bg-white p-4 flex items-center justify-center self-start">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imageUrl} alt={product.name} className="w-full aspect-square object-contain" />
                ) : (
                  <ProductImagePlaceholder aspectRatio="aspect-square" className="w-full rounded-lg" name={product.name} categorySlug={product.categorySlug} />
                )}
              </div>

              <div className="space-y-4 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <ClassBadge classification={product.classification} />
                  {product.isNew && <span className="border border-line bg-porcelain text-ink px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide">New</span>}
                </div>
                <div>
                  <p className="text-sm text-muted-fg">
                    {product.brand}{product.manufacturer ? ` · ${product.manufacturer}` : ''}
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink mt-1">{product.name}</h1>
                </div>
                <StarRating rating={product.rating} reviewCount={product.reviewCount} size={14} />

                {visibleSpecs.length > 0 && (
                  <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm pt-2 border-t border-line">
                    {visibleSpecs.slice(0, 4).map(([k, v]) => (
                      <React.Fragment key={k}>
                        <dt className="text-muted-fg">{k}</dt>
                        <dd className="text-ink">{v}</dd>
                      </React.Fragment>
                    ))}
                  </dl>
                )}
              </div>
            </div>

            <Section id="about" title="About this product" open>
              <div className="max-w-3xl text-sm sm:text-base text-ink leading-relaxed space-y-3">
                {product.description && <p>{product.description}</p>}
                {product.ingredients && (
                  <p><span className="font-semibold">Ingredients: </span><span className="text-muted-fg">{product.ingredients}</span></p>
                )}
                {visibleSpecs.length > 0 && (
                  <dl className="grid sm:grid-cols-2 gap-x-8 text-sm border-t border-line pt-3">
                    {visibleSpecs.map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 py-1.5 border-b border-line last:border-b-0">
                        <dt className="text-muted-fg">{k}</dt>
                        <dd className="text-ink text-right">{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </Section>

            {product.directions && (
              <Section id="directions" title="Directions" open>
                <p className="max-w-3xl text-sm sm:text-base text-ink leading-relaxed">{product.directions}</p>
              </Section>
            )}

            {product.warnings && (
              <Section id="warnings" title="Warnings">
                <p className="max-w-3xl text-sm sm:text-base text-ink leading-relaxed">{product.warnings}</p>
              </Section>
            )}

            <Section id="reviews" title="Reviews">
              <ReviewsPanel productId={product.id as Id<'products'>} rating={product.rating} reviewCount={product.reviewCount} />
            </Section>
          </div>

          {/* Buy box */}
          <aside className="lg:sticky lg:top-24 space-y-4">
            <div className="bg-paper rounded-xl border border-line p-4 sm:p-6 space-y-4">
              <div>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-semibold tracking-tight tabular-nums text-ink">
                    {formatPrice(product.price)}
                  </span>
                </div>
                {product.packSize && <p className="text-sm text-muted-fg mt-1">{product.packSize}</p>}
              </div>

              <p className={cn('text-sm font-medium', product.inStock ? 'text-success' : 'text-signal')}>
                {!product.inStock ? 'Out of stock' : lowStock ? `${product.stockQty} left` : 'In stock'}
              </p>

              {(isRx || product.ageRestricted) && (
                <div className="rounded-lg border border-line bg-porcelain px-3.5 py-3 text-sm">
                  {isRx && (
                    <>
                      <p className="font-semibold text-ink">Prescription required</p>
                      <p className="mt-0.5 text-muted-fg leading-relaxed">A pharmacist checks your prescription before we dispatch.</p>
                      <a href={waHref} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-medium text-petrol hover:underline underline-offset-2">
                        Send prescription on WhatsApp
                      </a>
                    </>
                  )}
                  {product.ageRestricted && (
                    <p className={cn('text-muted-fg leading-relaxed', isRx && 'mt-2')}>Buyers must be 18 or over.</p>
                  )}
                </div>
              )}

              <DeliveryArea className="border-t border-line pt-4" />

              <div className="flex items-center gap-3">
                <QuantityStepper value={qty} onChange={setQty} />
                <button
                  type="button"
                  onClick={handleWishlist}
                  aria-pressed={wishlisted}
                  className={cn(
                    'ml-auto h-10 w-10 flex items-center justify-center rounded-lg border active:scale-[0.97] transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40',
                    wishlisted ? 'border-signal text-signal' : 'border-line text-ink hover:border-ink'
                  )}
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
                </button>
              </div>

              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!product.inStock}
                  className="w-full bg-petrol hover:bg-petrol-700 text-white text-sm font-semibold py-3 rounded-lg transition-colors active:scale-[0.97] duration-100 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40 focus-visible:ring-offset-2"
                >
                  {product.inStock ? 'Add to cart' : 'Unavailable'}
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className="w-full border border-petrol text-petrol hover:bg-petrol-50 text-sm font-semibold py-3 rounded-lg transition-colors active:scale-[0.97] duration-100 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40"
                >
                  Buy now
                </button>
              </div>
            </div>

            <a
              href={askHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl border border-line bg-paper px-4 py-3 text-sm font-medium text-ink hover:border-ink/40 transition-colors duration-100 active:scale-[0.99]"
            >
              Ask a pharmacist about this product
              <span aria-hidden className="text-muted-fg">&rarr;</span>
            </a>
            <ul className="grid grid-cols-3 divide-x divide-line rounded-xl border border-line bg-paper text-center text-xs text-muted-fg">
              <li className="px-2 py-3">Genuine products</li>
              <li className="px-2 py-3">Licensed pharmacy</li>
              <li className="px-2 py-3">Easy returns</li>
            </ul>
          </aside>
        </div>

        {relatedFiltered && relatedFiltered.length > 0 && (
          <section className="pt-4">
            <h2 className="text-xl font-semibold tracking-tight text-ink mb-4">
              {needSlug ? 'For the same need' : isRx ? 'Similar' : 'Related'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedFiltered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky add-to-cart */}
      <div className="lg:hidden fixed inset-x-0 bottom-16 md:bottom-0 z-30 bg-paper/95 backdrop-blur border-t border-line px-4 py-3 flex items-center gap-3">
        <div className="min-w-0">
          <p className="text-lg font-semibold tabular-nums leading-tight text-ink">{formatPrice(product.price * qty)}</p>
          <p className="text-xs text-muted-fg truncate">{product.inStock ? 'In stock' : 'Out of stock'}</p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!product.inStock}
          className="ml-auto bg-petrol hover:bg-petrol-700 text-white text-sm font-semibold px-6 py-3 rounded-lg active:scale-[0.97] transition-transform duration-100 disabled:opacity-50"
        >
          Add to cart
        </button>
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
      const m = String((err as { message?: string })?.message ?? '');
      const hit = m.match(/Uncaught Error: ([^\n]+)/);
      toast(hit ? hit[1].trim() : 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      {rating ? (
        <div className="flex items-center gap-4 mb-6">
          <span className="text-4xl font-semibold tracking-tight tabular-nums text-ink">{rating.toFixed(1)}</span>
          <div>
            <StarRating rating={rating} size={16} />
            <p className="text-sm text-muted-fg mt-1">{reviewCount ?? 0} review{reviewCount === 1 ? '' : 's'}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-fg mb-6">No reviews yet.</p>
      )}

      {reviews && reviews.length > 0 && (
        <div className="divide-y divide-line mb-6 border-t border-line">
          {reviews.map((r) => (
            <div key={r._id} className="py-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm text-ink">{r.customerName || 'Customer'}</span>
                <StarRating rating={r.rating} size={12} />
              </div>
              {r.comment && <p className="text-sm text-muted-fg leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <form onSubmit={handleSubmit} className="bg-porcelain border border-line rounded-xl p-4 space-y-3">
          <div>
            <p className="text-sm font-medium text-ink mb-1.5">Your rating</p>
            <StarRatingInput value={stars} onChange={setStars} />
          </div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" className={field} />
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Comment (optional)" className={cn(field, 'resize-none')} />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-petrol hover:bg-petrol-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors active:scale-[0.97] duration-100 disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Submit review'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted-fg text-sm font-medium px-3 hover:text-ink transition-colors">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="border border-line bg-paper hover:bg-porcelain text-ink text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors active:scale-[0.97] duration-100"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-3 w-12" /><Skeleton className="h-3 w-3" /><Skeleton className="h-3 w-20" /><Skeleton className="h-3 w-3" /><Skeleton className="h-3 w-32" />
        </div>
        <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-4">
          <div className="bg-paper rounded-xl border border-line p-4 sm:p-6 grid md:grid-cols-[minmax(0,360px)_1fr] gap-6">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="bg-paper rounded-xl border border-line p-6 space-y-4">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
}
