'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Home, Pill } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

export default function NotFound() {
  return (
    <div className="min-h-screen bg-porcelain flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="max-w-md w-full text-center"
      >
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
