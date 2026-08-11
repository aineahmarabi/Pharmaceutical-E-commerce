'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Home, Pill } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

const floatingPills = [
  { top: '14%', left: '10%', rotate: -18, delay: 0, duration: 5.5 },
  { top: '72%', left: '14%', rotate: 24, delay: 0.6, duration: 6.5 },
  { top: '20%', left: '86%', rotate: 12, delay: 0.3, duration: 6 },
  { top: '78%', left: '84%', rotate: -22, delay: 0.9, duration: 5 },
];

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-porcelain flex items-center justify-center px-4 overflow-hidden">
      {floatingPills.map((p, i) => (
        <motion.div
          key={i}
          className="hidden sm:block absolute w-10 h-5 rounded-full bg-petrol/10 border border-petrol/10"
          style={{ top: p.top, left: p.left, rotate: p.rotate }}
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="relative max-w-md w-full text-center bg-paper border border-line rounded-3xl shadow-sm px-8 pt-9 pb-8"
      >
        <div
          className="absolute -top-px left-6 right-6 h-px"
          style={{ backgroundImage: 'repeating-linear-gradient(90deg, var(--color-line) 0 6px, transparent 6px 12px)' }}
        />

        <p className="font-mono text-[11px] tracking-widest text-petrol-300 uppercase mb-5">Rx · Pharmacare</p>

        <div className="relative mx-auto w-24 h-24 mb-6">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-24 rounded-3xl bg-petrol/10 flex items-center justify-center"
          >
            <Pill size={40} className="text-petrol" strokeWidth={1.5} />
          </motion.div>
          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-signal text-paper flex items-center justify-center font-mono font-bold text-xs shadow-md">
            404
          </div>
        </div>

        <h1 className="font-display font-bold text-2xl text-ink tracking-tight">Prescription not found</h1>
        <p className="text-sm text-ink/60 mt-2 leading-relaxed">
          We looked everywhere on the shelf, but this page doesn't exist. It may have expired, moved, or the link was mistyped.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-7 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-petrol hover:bg-petrol-700 text-paper font-semibold px-5 py-3 rounded-xl transition-colors"
          >
            <Home size={16} /> Back to home
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 bg-paper border border-line hover:border-petrol/50 text-ink font-semibold px-5 py-3 rounded-xl transition-colors"
          >
            <Search size={16} /> Browse products
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
