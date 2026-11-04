'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/Breadcrumb';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { ProductGrid } from '@/components/product/ProductGrid';
import type { Product, ProductClass } from '@/lib/fixtures/types';

export interface SortOption {
  value: string;
  label: string;
}

export interface ActiveChip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface ControlledSort {
  value: string;
  onChange: (v: string) => void;
  options: SortOption[];
}

interface ListingViewProps {
  breadcrumb: BreadcrumbItem[];
  title: string;
  description?: string;
  products: Product[] | undefined;
  emptyTitle: string;
  emptyDescription: string;
  /** Server-driven sort. When omitted, products are sorted in the browser. */
  sort?: ControlledSort;
  /** Extra filter sections shown at the top of the rail (e.g. category and brand lists). */
  railTop?: React.ReactNode;
  /** Chips for filters applied outside this component. */
  externalChips?: ActiveChip[];
  onClearExternal?: () => void;
  pageSize?: number;
  /** Hide the built-in brand filter (when the page is already one brand). */
  hideBrandFilter?: boolean;
}

const LOCAL_SORT: SortOption[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name A to Z' },
];

const CLASS_LABELS: Record<ProductClass, string> = {
  OTC: 'OTC',
  P: 'Pharmacy (P)',
  POM: 'Prescription (POM)',
};

export function RailGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="py-4 first:pt-0 last:pb-0 border-t border-line first:border-t-0 min-w-0">
      <legend className="text-sm font-semibold text-ink mb-2 p-0">{title}</legend>
      {children}
    </fieldset>
  );
}

export function RailCheck({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  count?: number;
}) {
  return (
    <label className="flex items-center gap-2.5 py-1.5 text-sm text-ink cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-line accent-petrol"
      />
      <span className="flex-1 min-w-0 truncate">{label}</span>
      {typeof count === 'number' && <span className="text-xs text-muted-fg tabular-nums">{count}</span>}
    </label>
  );
}

export function RailOption({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
        active ? 'bg-porcelain text-ink font-semibold' : 'text-muted-fg hover:text-ink hover:bg-porcelain'
      }`}
    >
      {children}
    </button>
  );
}

export function ListingView({
  breadcrumb,
  title,
  description,
  products,
  emptyTitle,
  emptyDescription,
  sort,
  railTop,
  externalChips = [],
  onClearExternal,
  pageSize = 24,
  hideBrandFilter,
}: ListingViewProps) {
  const [localSort, setLocalSort] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [classes, setClasses] = useState<ProductClass[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);

  const sortValue = sort ? sort.value : localSort;
  const sortOptions = sort ? sort.options : LOCAL_SORT;
  const setSort = sort ? sort.onChange : setLocalSort;

  const brandCounts = useMemo(() => {
    const map = new Map<string, number>();
    (products ?? []).forEach((p) => map.set(p.brand, (map.get(p.brand) ?? 0) + 1));
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [products]);

  const classPresent = useMemo(() => {
    const set = new Set<ProductClass>();
    (products ?? []).forEach((p) => set.add(p.classification));
    return (['OTC', 'P', 'POM'] as ProductClass[]).filter((c) => set.has(c));
  }, [products]);

  const visible = useMemo(() => {
    if (!products) return undefined;
    let list = products.filter(
      (p) =>
        (!inStockOnly || p.inStock) &&
        (classes.length === 0 || classes.includes(p.classification)) &&
        (brands.length === 0 || brands.includes(p.brand))
    );
    if (!sort) {
      if (localSort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
      else if (localSort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
      else if (localSort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [products, inStockOnly, classes, brands, sort, localSort]);

  // Reset to first page whenever the result set changes shape.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset pagination when result set changes
    setPage(1);
  }, [inStockOnly, classes, brands, sortValue, products?.length, externalChips.length]);

  const pageCount = visible ? Math.max(1, Math.ceil(visible.length / pageSize)) : 1;
  const safePage = Math.min(page, pageCount);
  const paged = visible?.slice((safePage - 1) * pageSize, safePage * pageSize);

  const chips: ActiveChip[] = [
    ...externalChips,
    ...(inStockOnly ? [{ key: 'stock', label: 'In stock', onRemove: () => setInStockOnly(false) }] : []),
    ...classes.map((c) => ({ key: `c-${c}`, label: c, onRemove: () => setClasses((l) => l.filter((x) => x !== c)) })),
    ...brands.map((b) => ({ key: `b-${b}`, label: b, onRemove: () => setBrands((l) => l.filter((x) => x !== b)) })),
  ];

  const clearAll = () => {
    setInStockOnly(false);
    setClasses([]);
    setBrands([]);
    onClearExternal?.();
  };

  const toggle = <T,>(list: T[], v: T, on: boolean) => (on ? [...list, v] : list.filter((x) => x !== v));

  const rail = (
    <div className="divide-y divide-line">
      {railTop}
      <RailGroup title="Availability">
        <RailCheck checked={inStockOnly} onChange={setInStockOnly} label="In stock only" />
      </RailGroup>
      {classPresent.length > 1 && (
        <RailGroup title="Type">
          {classPresent.map((c) => (
            <RailCheck
              key={c}
              checked={classes.includes(c)}
              onChange={(on) => setClasses((l) => toggle(l, c, on))}
              label={CLASS_LABELS[c]}
            />
          ))}
        </RailGroup>
      )}
      {!hideBrandFilter && brandCounts.length > 1 && (
        <RailGroup title="Brand">
          <div className="max-h-64 overflow-y-auto overscroll-contain pr-1">
            {brandCounts.map(([b, n]) => (
              <RailCheck
                key={b}
                checked={brands.includes(b)}
                onChange={(on) => setBrands((l) => toggle(l, b, on))}
                label={b}
                count={n}
              />
            ))}
          </div>
        </RailGroup>
      )}
    </div>
  );

  const count = visible?.length;

  return (
    <div className="bg-porcelain min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
        {/* Page header */}
        <header className="bg-paper rounded-xl border border-line p-4 sm:p-6">
          <Breadcrumb items={breadcrumb} />
          <div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink">{title}</h1>
              {description && <p className="mt-1 text-sm text-muted-fg leading-relaxed max-w-2xl">{description}</p>}
            </div>
            <p className="text-sm text-muted-fg tabular-nums" aria-live="polite">
              {count === undefined ? 'Loading' : `${count} ${count === 1 ? 'product' : 'products'}`}
            </p>
          </div>
        </header>

        <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-4 lg:items-start">
          {/* Desktop filter rail */}
          <aside className="hidden lg:block bg-paper rounded-xl border border-line p-4 sticky top-28" aria-label="Filters">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-ink">Filters</h2>
              {chips.length > 0 && (
                <button type="button" onClick={clearAll} className="text-xs text-petrol hover:underline underline-offset-2">
                  Clear all
                </button>
              )}
            </div>
            {rail}
          </aside>

          <section className="min-w-0 space-y-4">
            {/* Toolbar */}
            <div className="bg-paper rounded-xl border border-line px-3 py-3 sm:px-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  className="lg:hidden h-10 px-4 rounded-lg border border-line bg-paper text-sm font-medium text-ink hover:bg-porcelain transition-transform duration-100 active:scale-[0.97]"
                >
                  Filters{chips.length > 0 ? ` (${chips.length})` : ''}
                </button>
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-sm text-muted-fg hidden sm:inline">Sort by</span>
                  <Select
                    value={sortValue}
                    onChange={setSort}
                    options={sortOptions}
                    className="w-48"
                  />
                </div>
              </div>
              {chips.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {chips.map((chip) => (
                    <button
                      key={chip.key}
                      type="button"
                      onClick={chip.onRemove}
                      aria-label={`Remove filter ${chip.label}`}
                      className="inline-flex items-center gap-1.5 h-8 pl-3 pr-2 rounded-full border border-line bg-porcelain text-xs font-medium text-ink hover:border-ink/40 transition-colors"
                    >
                      {chip.label}
                      <X size={12} aria-hidden="true" />
                    </button>
                  ))}
                  <button type="button" onClick={clearAll} className="text-xs text-petrol hover:underline underline-offset-2 px-1">
                    Clear all
                  </button>
                </div>
              )}
            </div>

            <ProductGrid
              products={paged}
              skeletonCount={12}
              emptyTitle={chips.length > 0 && products && products.length > 0 ? 'No matches' : emptyTitle}
              emptyDescription={
                chips.length > 0 && products && products.length > 0
                  ? 'Remove a filter.'
                  : emptyDescription
              }
              emptyAction={
                chips.length > 0 ? (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="h-10 px-4 rounded-lg bg-petrol hover:bg-petrol-700 text-white text-sm font-medium transition-transform duration-100 active:scale-[0.97]"
                  >
                    Clear filters
                  </button>
                ) : (
                  <>
                    <Link href="/products" className="h-10 px-4 inline-flex items-center rounded-lg bg-petrol hover:bg-petrol-700 text-white text-sm font-medium">
                      All products
                    </Link>
                    <Link href="/contact" className="h-10 px-4 inline-flex items-center rounded-lg border border-line text-ink hover:bg-porcelain text-sm font-medium">
                      Contact us
                    </Link>
                  </>
                )
              }
            />

            {visible && visible.length > pageSize && (
              <div className="bg-paper rounded-xl border border-line p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-muted-fg tabular-nums">
                  Showing {(safePage - 1) * pageSize + 1} to {Math.min(safePage * pageSize, visible.length)} of {visible.length}
                </p>
                <Pagination
                  page={safePage}
                  pageCount={pageCount}
                  onChange={(p) => {
                    setPage(p);
                    window.scrollTo({ top: 0 });
                  }}
                />
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
            <motion.div
              className="absolute inset-0 bg-deep/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 max-h-[85vh] flex flex-col bg-paper rounded-t-xl border-t border-line"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-line">
                <h2 className="text-base font-semibold text-ink">Filters</h2>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  aria-label="Close filters"
                  className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-porcelain text-ink"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">{rail}</div>
              <div className="flex items-center gap-3 px-4 py-3 border-t border-line">
                <button
                  type="button"
                  onClick={clearAll}
                  className="h-11 px-4 rounded-lg border border-line text-sm font-medium text-ink hover:bg-porcelain"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  className="flex-1 h-11 rounded-lg bg-petrol hover:bg-petrol-700 text-white text-sm font-medium transition-transform duration-100 active:scale-[0.97]"
                >
                  {count === undefined ? 'Show results' : `Show ${count} ${count === 1 ? 'product' : 'products'}`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
