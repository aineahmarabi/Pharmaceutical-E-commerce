'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { categories } from '@/lib/fixtures/categories';
import { SearchResultSkeleton } from '@/components/ui/Skeleton';
import { ProductImagePlaceholder } from '@/components/ui/ProductImagePlaceholder';
import { useDebounce } from '@/hooks/useDebounce';
import { formatPrice, cn } from '@/lib/utils';

const popularSearches = ['Paracetamol', 'Vitamin D', 'Amoxicillin', 'Cetirizine', 'Ibuprofen'];
const recentSearches = ['Vitamin C', 'Panadol'];

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const chip =
  'rounded-full border border-line bg-paper px-3 py-1.5 text-sm text-ink transition-colors hover:border-petrol hover:text-petrol focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40';
const groupLabel = 'px-4 pb-1 pt-3 text-xs font-semibold text-muted-fg';

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);
  const results = useQuery(api.products.searchProducts, { term: debouncedQuery, limit: 6 });
  const liveCategories = useQuery(api.taxonomy.listCategories, {});
  const brandsResult = useQuery(api.brands.list);
  const conditionsResult = useQuery(api.taxonomy.listConditions, {});
  const isSearching = query.trim().length > 0 && results === undefined;

  const term = query.trim().toLowerCase();
  const categorySource = liveCategories && liveCategories.length > 0 ? liveCategories : categories;
  const matchedCategories = useMemo(
    () => (term ? categorySource.filter((c) => c.name.toLowerCase().includes(term)).slice(0, 4) : []),
    [term, categorySource],
  );
  const matchedBrands = useMemo(
    () => (term && Array.isArray(brandsResult) ? brandsResult.filter((b) => b.name.toLowerCase().includes(term)).slice(0, 4) : []),
    [term, brandsResult],
  );

  const matchedConditions = useMemo(
    () => (term && Array.isArray(conditionsResult) ? conditionsResult.filter((c) => c.name.toLowerCase().includes(term)).slice(0, 4) : []),
    [term, conditionsResult],
  );

  // Flat, ordered list of destinations for arrow-key navigation.
  const hrefs: string[] = useMemo(() => {
    if (!term) return [];
    return [
      ...(results ?? []).map((p) => `/products/${p.slug}`),
      ...matchedCategories.map((c) => `/category/${c.slug}`),
      ...matchedConditions.map((c) => `/search?q=${encodeURIComponent(c.name)}`),
      ...matchedBrands.map((b) => `/brand/${b.slug}`),
    ];
  }, [term, results, matchedCategories, matchedConditions, matchedBrands]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset search state whenever the overlay opens
      setQuery('');
      setActiveIdx(-1);
    }
  }, [open]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset highlighted result when query changes
    setActiveIdx(-1);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown' && hrefs.length) {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % hrefs.length);
    } else if (e.key === 'ArrowUp' && hrefs.length) {
      e.preventDefault();
      setActiveIdx((i) => (i <= 0 ? hrefs.length - 1 : i - 1));
    } else if (e.key === 'Enter' && query.trim()) {
      window.location.href = activeIdx >= 0 && hrefs[activeIdx] ? hrefs[activeIdx] : `/search?q=${encodeURIComponent(query)}`;
      onClose();
    }
  };

  const rowClass = (idx: number) =>
    cn(
      'flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-porcelain',
      activeIdx === idx && 'bg-porcelain',
    );

  const productCount = results?.length ?? 0;
  const catOffset = productCount;
  const condOffset = productCount + matchedCategories.length;
  const brandOffset = condOffset + matchedConditions.length;
  const hasAny = productCount > 0 || matchedCategories.length > 0 || matchedConditions.length > 0 || matchedBrands.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-deep/50"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
            className="fixed left-1/2 top-4 z-[70] w-full max-w-2xl -translate-x-1/2 px-4 sm:top-[10vh]"
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
          >
            <div className="overflow-hidden rounded-xl border border-line bg-paper shadow-xl">
              <div className="flex items-center gap-3 border-b border-line px-4 py-3">
                <Search size={20} className="shrink-0 text-muted-fg" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What do you need today?"
                  aria-label="Search"
                  className="h-10 flex-1 bg-transparent text-base text-ink placeholder:text-muted-fg focus:outline-none"
                  autoComplete="off"
                  spellCheck={false}
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} className="rounded-lg p-1.5 text-muted-fg transition-colors hover:text-ink" aria-label="Clear search">
                    <X size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-line px-2 py-1 text-xs font-medium text-muted-fg transition-colors hover:text-ink"
                >
                  Esc
                </button>
              </div>

              <div className="max-h-[65vh] overflow-y-auto overscroll-contain">
                {isSearching && (
                  <div className="py-2">
                    {Array.from({ length: 4 }).map((_, i) => <SearchResultSkeleton key={i} />)}
                  </div>
                )}

                {!isSearching && query && !hasAny && (
                  <div className="px-4 py-10 text-center">
                    <p className="text-sm font-medium text-ink">No matches for &quot;{query}&quot;</p>
                    <p className="mt-1 text-sm text-muted-fg">Check the spelling, or ask a pharmacist to help you find it.</p>
                  </div>
                )}

                {!isSearching && query && hasAny && (
                  <div className="pb-2">
                    {productCount > 0 && (
                      <>
                        <p className={groupLabel}>Products</p>
                        {results!.map((p, i) => (
                          <Link key={p._id} href={`/products/${p.slug}`} onClick={onClose} onMouseEnter={() => setActiveIdx(i)} className={rowClass(i)}>
                            <ProductImagePlaceholder
                              className="h-10 w-10 shrink-0 rounded-lg"
                              aspectRatio=""
                              size="sm"
                              name={p.name}
                              categorySlug={p.categorySlug}
                              imageUrl={p.imageUrl}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                              <p className="truncate text-xs text-muted-fg">{p.brand}</p>
                            </div>
                            <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">{formatPrice(p.price)}</span>
                          </Link>
                        ))}
                      </>
                    )}
                    {matchedCategories.length > 0 && (
                      <>
                        <p className={groupLabel}>Categories</p>
                        {matchedCategories.map((c, i) => (
                          <Link key={c.slug} href={`/category/${c.slug}`} onClick={onClose} onMouseEnter={() => setActiveIdx(catOffset + i)} className={rowClass(catOffset + i)}>
                            <span className="flex-1 text-sm text-ink">{c.name}</span>
                            <ArrowRight size={14} className="text-muted-fg" />
                          </Link>
                        ))}
                      </>
                    )}
                    {matchedConditions.length > 0 && (
                      <>
                        <p className={groupLabel}>Conditions</p>
                        {matchedConditions.map((c, i) => (
                          <Link key={c.slug} href={`/search?q=${encodeURIComponent(c.name)}`} onClick={onClose} onMouseEnter={() => setActiveIdx(condOffset + i)} className={rowClass(condOffset + i)}>
                            <span className="flex-1 text-sm text-ink">{c.name}</span>
                            <ArrowRight size={14} className="text-muted-fg" />
                          </Link>
                        ))}
                      </>
                    )}
                    {matchedBrands.length > 0 && (
                      <>
                        <p className={groupLabel}>Brands</p>
                        {matchedBrands.map((b, i) => (
                          <Link key={b.slug} href={`/brand/${b.slug}`} onClick={onClose} onMouseEnter={() => setActiveIdx(brandOffset + i)} className={rowClass(brandOffset + i)}>
                            <span className="flex-1 text-sm text-ink">{b.name}</span>
                            <ArrowRight size={14} className="text-muted-fg" />
                          </Link>
                        ))}
                      </>
                    )}
                  </div>
                )}

                {!isSearching && query && (
                  <div className="border-t border-line px-4 py-3">
                    <Link
                      href={`/search?q=${encodeURIComponent(query)}`}
                      onClick={onClose}
                      className="inline-flex items-center gap-2 text-sm font-medium text-petrol underline-offset-4 hover:underline"
                    >
                      See all results for &quot;{query}&quot; <ArrowRight size={14} />
                    </Link>
                  </div>
                )}

                {!query && (
                  <div className="space-y-5 p-4">
                    <div>
                      <p className="mb-2 text-xs font-semibold text-muted-fg">Recent searches</p>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((r) => (
                          <button key={r} type="button" onClick={() => setQuery(r)} className={chip}>{r}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold text-muted-fg">Popular searches</p>
                      <div className="flex flex-wrap gap-2">
                        {popularSearches.map((s) => (
                          <button key={s} type="button" onClick={() => setQuery(s)} className={chip}>{s}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold text-muted-fg">Browse categories</p>
                      <div className="flex flex-wrap gap-2">
                        {categorySource.slice(0, 6).map((c) => (
                          <Link key={c.slug} href={`/category/${c.slug}`} onClick={onClose} className={chip}>{c.name}</Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
