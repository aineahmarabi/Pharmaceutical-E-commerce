'use client';

import React, { Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, LayoutGrid, LayoutList, ChevronDown, ChevronUp } from 'lucide-react';
import { categories, brands } from '@/lib/fixtures/categories';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';

const ease = [0.16, 1, 0.3, 1] as const;

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'new', label: 'New Arrivals' },
];

function Accordion({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-line/50 first:border-t-0">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between py-3 text-sm font-medium text-ink hover:text-petrol transition-colors">
        {title}
        {open ? <ChevronUp size={14} className="text-petrol-300" /> : <ChevronDown size={14} className="text-petrol-300" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState('featured');
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeCat, setActiveCat] = useState('all');
  const [activeBrand, setActiveBrand] = useState('all');

  const sidebar = (
    <div className="space-y-0 bg-paper rounded-2xl border border-line/50 p-5 divide-y divide-line/40">
      <div className="pb-4">
        <p className="font-mono text-xs uppercase tracking-widest text-petrol-300">Filters</p>
      </div>
      <Accordion title="Category">
        <div className="space-y-1 pt-1 max-h-52 overflow-y-auto">
          <button onClick={() => setActiveCat('all')} className={`w-full text-left px-3 py-1.5 rounded-xl text-sm transition-colors ${activeCat === 'all' ? 'bg-petrol text-paper' : 'text-ink hover:bg-petrol-50'}`}>All Categories</button>
          {categories.map((c) => (
            <button key={c.slug} onClick={() => setActiveCat(c.slug)} className={`w-full flex justify-between text-left px-3 py-1.5 rounded-xl text-sm transition-colors ${activeCat === c.slug ? 'bg-petrol text-paper' : 'text-ink hover:bg-petrol-50'}`}>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </Accordion>
      <Accordion title="Brand" defaultOpen={false}>
        <div className="space-y-1 pt-1">
          <button onClick={() => setActiveBrand('all')} className={`w-full text-left px-3 py-1.5 rounded-xl text-sm transition-colors ${activeBrand === 'all' ? 'bg-petrol text-paper' : 'text-ink hover:bg-petrol-50'}`}>All Brands</button>
          {brands.map((b) => (
            <button key={b.slug} onClick={() => setActiveBrand(b.slug)} className={`w-full text-left px-3 py-1.5 rounded-xl text-sm transition-colors ${activeBrand === b.slug ? 'bg-petrol text-paper' : 'text-ink hover:bg-petrol-50'}`}>{b.name}</button>
          ))}
        </div>
      </Accordion>
    </div>
  );

  return (
    <div className="min-h-screen bg-porcelain">
      <div className="bg-ink py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <nav className="text-xs text-porcelain/50 mb-3 flex gap-2">
              <a href="/" className="hover:text-porcelain/80">Home</a><span>/</span><span className="text-porcelain/80">Products</span>
            </nav>
            <h1 className="font-display font-extrabold text-3xl text-porcelain tracking-tight">All Products</h1>
            <p className="text-porcelain/50 text-sm mt-1">OTC, Pharmacy-supervised &amp; Prescription medicines</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <aside className="w-64 flex-shrink-0 hidden md:block">{sidebar}</aside>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5 gap-3">
              <button onClick={() => setFilterOpen((v) => !v)} className="md:hidden flex items-center gap-1.5 text-sm text-ink border border-line rounded-xl px-3 py-2 hover:bg-petrol-50 transition-colors">
                <Filter size={14} />Filters
              </button>
              <div className="flex items-center gap-3 ml-auto">
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-sm bg-paper border border-line rounded-xl px-3 py-2 text-ink focus:outline-none focus:border-petrol">
                  {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <div className="flex items-center border border-line rounded-xl overflow-hidden">
                  <button onClick={() => setLayout('grid')} className={`p-2 transition-colors ${layout === 'grid' ? 'bg-petrol text-paper' : 'text-ink hover:bg-petrol-50'}`}><LayoutGrid size={14} /></button>
                  <button onClick={() => setLayout('list')} className={`p-2 transition-colors ${layout === 'list' ? 'bg-petrol text-paper' : 'text-ink hover:bg-petrol-50'}`}><LayoutList size={14} /></button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {filterOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden mb-5">
                  {sidebar}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
