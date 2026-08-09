'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { categories } from '@/lib/fixtures/categories';
import { SearchResultSkeleton } from '@/components/ui/Skeleton';
import { ProductImagePlaceholder } from '@/components/ui/ProductImagePlaceholder';
import { useDebounce } from '@/hooks/useDebounce';
import { formatPrice } from '@/lib/utils';

const popularSearches = ['Paracetamol', 'Vitamin D', 'Amoxicillin', 'Cetirizine', 'Ibuprofen'];
const recentSearches = ['Vitamin C', 'Panadol'];

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);
  const results = useQuery(api.products.searchProducts, { term: debouncedQuery, limit: 6 });
  const isSearching = query.trim().length > 0 && results === undefined;

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
      setQuery('');
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'Enter' && query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] w-full max-w-2xl px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
          >
            <div className="bg-paper rounded-2xl shadow-2xl overflow-hidden border border-line/60">
              {/* Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-line/60">
                <Search size={20} className="text-petrol flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search medicines, brands, conditions…"
                  className="flex-1 bg-transparent text-lg text-ink placeholder:text-petrol-300/60 focus:outline-none"
                  autoComplete="off"
                  spellCheck={false}
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-petrol-300 hover:text-ink transition-colors">
                    <X size={16} />
                  </button>
                )}
                <button onClick={onClose} className="text-petrol-300 hover:text-ink transition-colors">
                  <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 bg-petrol-50 border border-line rounded text-[10px] font-mono">ESC</kbd>
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {isSearching && (
                  <div className="py-2">
                    {Array.from({ length: 4 }).map((_, i) => <SearchResultSkeleton key={i} />)}
                  </div>
                )}

                {!isSearching && query && results && results.length === 0 && (
                  <div className="px-5 py-8 text-center text-sm text-petrol-300">
                    No products found for &quot;{query}&quot;
                  </div>
                )}

                {!isSearching && query && results && results.length > 0 && (
                  <div className="py-2">
                    {results.map((p) => (
                      <Link
                        key={p._id}
                        href={`/products/${p.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 px-5 py-2.5 hover:bg-petrol-50 transition-colors"
                      >
                        <ProductImagePlaceholder
                          className="w-10 h-10 rounded-xl flex-shrink-0"
                          aspectRatio=""
                          size="sm"
                          name={p.name}
                          categorySlug={p.categorySlug}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                          <p className="text-xs text-petrol-300 truncate">{p.brand}</p>
                        </div>
                        <span className="font-mono text-sm text-ink font-semibold flex-shrink-0">{formatPrice(p.price)}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {!isSearching && query && (
                  <div className="px-5 py-3 border-t border-line/50">
                    <Link
                      href={`/search?q=${encodeURIComponent(query)}`}
                      onClick={onClose}
                      className="flex items-center gap-2 text-sm text-petrol font-medium hover:gap-3 transition-all"
                    >
                      See all results for &quot;{query}&quot; <ArrowRight size={14} />
                    </Link>
                  </div>
                )}

                {!query && (
                  <div className="p-5 space-y-5">
                    <div>
                      <p className="text-xs font-mono uppercase tracking-widest text-petrol-300 mb-3">Recent searches</p>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((r) => (
                          <button key={r} onClick={() => setQuery(r)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-petrol-50 border border-line text-sm text-ink rounded-full hover:border-petrol transition-colors">
                            <Clock size={12} className="text-petrol-300" />{r}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-widest text-petrol-300 mb-3">Popular searches</p>
                      <div className="flex flex-wrap gap-2">
                        {popularSearches.map((s) => (
                          <button key={s} onClick={() => setQuery(s)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-petrol-50 border border-line text-sm text-ink rounded-full hover:border-petrol transition-colors">
                            <TrendingUp size={12} className="text-petrol-300" />{s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-widest text-petrol-300 mb-3">Browse categories</p>
                      <div className="flex flex-wrap gap-2">
                        {categories.slice(0, 5).map((c) => (
                          <Link key={c.slug} href={`/category/${c.slug}`} onClick={onClose} className="px-3 py-1.5 bg-petrol-50 border border-line text-sm text-petrol font-medium rounded-full hover:bg-petrol hover:text-paper transition-colors">
                            {c.name}
                          </Link>
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
