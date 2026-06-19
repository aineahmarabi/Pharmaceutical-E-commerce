'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Pill, Wind, Leaf, Sparkles, Baby, Smile, Activity, Heart } from 'lucide-react';
import { categories } from '@/lib/fixtures/categories';

const ease = [0.16, 1, 0.3, 1] as const;

const catMeta: Record<string, { icon: React.ElementType; bg: string; fg: string }> = {
  'pain-fever':    { icon: Pill,      bg: 'bg-signal/10',   fg: 'text-signal' },
  'cold-flu':      { icon: Wind,      bg: 'bg-info/10',     fg: 'text-info' },
  'vitamins':      { icon: Leaf,      bg: 'bg-success/10',  fg: 'text-success' },
  'skincare':      { icon: Sparkles,  bg: 'bg-amber/10',    fg: 'text-warning' },
  'baby-mum':      { icon: Baby,      bg: 'bg-petrol-50',   fg: 'text-petrol' },
  'digestive':     { icon: Smile,     bg: 'bg-signal/10',   fg: 'text-signal' },
  'diabetes':      { icon: Activity,  bg: 'bg-danger/10',   fg: 'text-danger' },
  'personal-care': { icon: Heart,     bg: 'bg-success/10',  fg: 'text-success' },
};

export function CategorySection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-paper">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-petrol-300 mb-1">Shop by Category</p>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-ink tracking-tight">Find what you need</h2>
          </div>
          <Link href="/products" className="hidden sm:flex items-center gap-1.5 text-sm text-petrol font-medium hover:gap-3 transition-all">
            View all <ArrowRight size={14} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat, i) => {
            const meta = catMeta[cat.slug] ?? { icon: Pill, bg: 'bg-petrol-50', fg: 'text-petrol' };
            const Icon = meta.icon;
            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.45, ease }}
              >
                <Link
                  href={`/category/${cat.slug}`}
                  className="group flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-line/50 bg-porcelain hover:bg-petrol/5 hover:border-petrol/30 transition-all text-center"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${meta.bg} transition-transform group-hover:scale-110`}>
                    <Icon size={20} className={meta.fg} />
                  </div>
                  <span className="font-medium text-xs text-ink leading-snug">{cat.name}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
