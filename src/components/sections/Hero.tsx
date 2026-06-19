'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { branding } from '@/lib/config/branding';
import { Skeleton } from '@/components/ui/Skeleton';

const ease = [0.16, 1, 0.3, 1] as const;
const words = ['Your', 'health,', 'delivered.'];

const drifts = [
  { top: '8%', left: '18%', width: 200, zIndex: 5, rotate: -3 },
  { top: '38%', left: '2%', width: 185, zIndex: 10, rotate: 5 },
  { top: '60%', left: '36%', width: 195, zIndex: 5, rotate: -7 },
];

function FloatingSkeletonCard({ style }: { style: React.CSSProperties }) {
  return (
    <div style={style} className="absolute">
      <div className="rounded-2xl bg-paper/90 border border-line/40 shadow-2xl overflow-hidden">
        <div className="bg-petrol-50/60 h-24 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none" className="opacity-20">
            <rect x="8" y="18" width="32" height="12" rx="6" stroke="#0E4D45" strokeWidth="2" fill="none" />
            <rect x="8" y="18" width="16" height="12" rx="6" fill="#0E4D45" fillOpacity="0.4" />
          </svg>
        </div>
        <div className="p-3 space-y-1.5">
          <Skeleton className="h-2.5 w-16 opacity-50" />
          <Skeleton className="h-3 w-full opacity-50" />
          <Skeleton className="h-2.5 w-10 opacity-40" />
          <Skeleton className="h-4 w-20 mt-1 opacity-50" />
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="min-h-[85vh] bg-ink relative overflow-hidden flex items-center">
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute rounded-full bg-petrol blur-[100px] opacity-30"
          style={{ width: '60vw', height: '60vh', top: '20%', left: '55%', transform: 'translate(-50%,-50%)' }}
        />
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -(10 + i * 3), 0], rotate: [0, i % 2 === 0 ? 6 : -6, 0] }}
            transition={{ duration: 8 + i * 1.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
            className="absolute rounded-full border border-petrol-300/20"
            style={{
              width: 28 + (i % 3) * 14,
              height: 12,
              top: `${10 + i * 10}%`,
              left: `${5 + i * 11}%`,
              transform: `rotate(${-40 + i * 22}deg)`,
              opacity: 0.1,
              backgroundColor: 'rgba(95,168,156,0.15)',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-10 grid lg:grid-cols-[55fr_45fr] gap-12 items-center">
        {/* LEFT */}
        <div>
          <h1 className="font-display font-extrabold text-porcelain tracking-tighter leading-[1.08]" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.25rem)' }}>
            {words.map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease }}
                className="inline-block mr-3"
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5, ease }}
            className="mt-6 text-lg text-porcelain/70 leading-relaxed max-w-md"
          >
            Browse genuine medicines and wellness products with same-day delivery across Kenya.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5, ease }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-signal hover:bg-signal/90 text-white font-semibold px-8 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Shop now <ArrowRight size={16} />
            </Link>
            <a
              href={`https://wa.me/${branding.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-2 border-porcelain/25 text-porcelain hover:bg-porcelain/10 font-semibold px-8 py-3.5 rounded-xl transition-colors"
            >
              <MessageCircle size={18} />
              Talk to pharmacist
            </a>
          </motion.div>
        </div>

        {/* RIGHT — skeleton product cards (live data coming soon) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.7, ease }}
          className="hidden lg:block relative h-[480px]"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-petrol blur-[80px] opacity-25 pointer-events-none" />
          {drifts.map((d, i) => (
            <FloatingSkeletonCard
              key={i}
              style={{
                top: d.top,
                left: d.left,
                width: d.width,
                zIndex: d.zIndex,
                transform: `rotate(${d.rotate}deg)`,
              }}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
