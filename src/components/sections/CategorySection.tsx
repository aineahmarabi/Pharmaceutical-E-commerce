'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, Pill, Wind, Leaf, Sparkles, Baby, Smile, Activity, Heart,
  Shield, Lock, HeartHandshake, Flower2, CircleDot, HeartPulse, ShieldCheck, Bug, Droplets, Stethoscope,
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { categories as fixtureCategories } from '@/lib/fixtures/categories';

const ease = [0.16, 1, 0.3, 1] as const;

const catMeta: Record<string, { icon: React.ElementType; bg: string; fg: string }> = {
  // Legacy fixture categories
  'pain-fever':    { icon: Pill,      bg: 'bg-signal/10',   fg: 'text-signal' },
  'cold-flu':      { icon: Wind,      bg: 'bg-info/10',     fg: 'text-info' },
  'vitamins':      { icon: Leaf,      bg: 'bg-success/10',  fg: 'text-success' },
  'skincare':      { icon: Sparkles,  bg: 'bg-amber/10',    fg: 'text-warning' },
  'baby-mum':      { icon: Baby,      bg: 'bg-petrol-50',   fg: 'text-petrol' },
  'digestive':     { icon: Smile,     bg: 'bg-signal/10',   fg: 'text-signal' },
  'diabetes':      { icon: Activity,  bg: 'bg-danger/10',   fg: 'text-danger' },
  'personal-care': { icon: Heart,     bg: 'bg-success/10',  fg: 'text-success' },
  // Catalogue categories
  'pain-relief':            { icon: Pill,          bg: 'bg-signal/10',  fg: 'text-signal' },
  'antibiotics':             { icon: Shield,         bg: 'bg-petrol-50',  fg: 'text-petrol' },
  'cough-cold':              { icon: Wind,           bg: 'bg-info/10',    fg: 'text-info' },
  'baby-care':               { icon: Baby,           bg: 'bg-petrol-50',  fg: 'text-petrol' },
  'skin-care':               { icon: Sparkles,       bg: 'bg-amber/10',   fg: 'text-warning' },
  'arthritis-joint-care':    { icon: Activity,       bg: 'bg-danger/10',  fg: 'text-danger' },
  'sexual-wellness':         { icon: Lock,           bg: 'bg-petrol-50',  fg: 'text-petrol' },
  'mother-baby':             { icon: HeartHandshake, bg: 'bg-petrol-50',  fg: 'text-petrol' },
  'allergy':                 { icon: Flower2,        bg: 'bg-success/10', fg: 'text-success' },
  'vitamins-supplements':    { icon: Leaf,           bg: 'bg-success/10', fg: 'text-success' },
  'digestive-health':        { icon: CircleDot,      bg: 'bg-signal/10',  fg: 'text-signal' },
  'cardiovascular':          { icon: HeartPulse,     bg: 'bg-danger/10',  fg: 'text-danger' },
  'anti-infective':          { icon: ShieldCheck,    bg: 'bg-petrol-50',  fg: 'text-petrol' },
  'antimalarial':            { icon: Bug,            bg: 'bg-success/10', fg: 'text-success' },
  'antifungal':              { icon: Droplets,       bg: 'bg-info/10',    fg: 'text-info' },
  'respiratory':             { icon: Stethoscope,    bg: 'bg-info/10',    fg: 'text-info' },
};

export function CategorySection() {
  const liveCategories = useQuery(api.taxonomy.listCategories, {});
  const categories = liveCategories && liveCategories.length > 0 ? liveCategories : fixtureCategories;
  const doubled = [...categories, ...categories];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-paper overflow-hidden">
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
      </div>

      <div className="overflow-hidden">
        <div className="flex gap-3 brand-rail" style={{ width: 'max-content' }}>
          {doubled.map((cat, i) => {
            const meta = catMeta[cat.slug] ?? { icon: Pill, bg: 'bg-petrol-50', fg: 'text-petrol' };
            const Icon = meta.icon;
            return (
              <Link
                key={`${cat.slug}-${i}`}
                href={`/category/${cat.slug}`}
                className="group flex-shrink-0 w-24 flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-line/50 bg-porcelain hover:bg-petrol/5 hover:border-petrol/30 transition-all text-center"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${meta.bg} transition-transform group-hover:scale-110`}>
                  <Icon size={20} className={meta.fg} />
                </div>
                <span className="font-medium text-xs text-ink leading-snug">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
