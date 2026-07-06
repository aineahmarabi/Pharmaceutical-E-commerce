'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import {
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Zap,
  Truck,
  Clock,
} from 'lucide-react';
import { branding } from '@/lib/config/branding';

// ─── Constants ──────────────────────────────────────────────────────────────
const CATEGORY_PILLS = [
  { label: 'All', slug: '' },
  { label: 'Pain Relief', slug: 'pain-fever' },
  { label: 'Vitamins', slug: 'vitamins' },
  { label: 'Skincare', slug: 'skincare' },
  { label: 'Cold & Flu', slug: 'cold-flu' },
  { label: 'Baby & Mum', slug: 'baby-mum' },
];

const TAGLINES = [
  'Vitamins & supplements',
  'Pain & fever relief',
  'Skincare & beauty',
  'Cold & flu remedies',
  'Baby & mother care',
];

const ease = [0.16, 1, 0.3, 1] as const;

const THEMES = [
  // 0: Vitamins & supplements (Greenish)
  { a: 'radial-gradient(circle, #16695e 0%, #5FA89C55 45%, transparent 72%)',
    b: 'radial-gradient(circle, #0A3B35 0%, #0E4D4577 50%, transparent 78%)',
    c: 'radial-gradient(circle, #5FA89C44 0%, #0E4D4522 55%, transparent 75%)' },
  // 1: Pain & fever relief (Reddish)
  { a: 'radial-gradient(circle, #8A2733 0%, #B3505D55 45%, transparent 72%)',
    b: 'radial-gradient(circle, #4A1119 0%, #701D2877 50%, transparent 78%)',
    c: 'radial-gradient(circle, #B3505D44 0%, #701D2822 55%, transparent 75%)' },
  // 2: Skincare & beauty (Teal/Cyan)
  { a: 'radial-gradient(circle, #145D70 0%, #51A3B855 45%, transparent 72%)',
    b: 'radial-gradient(circle, #0A313C 0%, #15465677 50%, transparent 78%)',
    c: 'radial-gradient(circle, #51A3B844 0%, #15465622 55%, transparent 75%)' },
  // 3: Cold & flu remedies (Blue/Purple)
  { a: 'radial-gradient(circle, #3B2973 0%, #6A56AD55 45%, transparent 72%)',
    b: 'radial-gradient(circle, #1D143D 0%, #2A1D5977 50%, transparent 78%)',
    c: 'radial-gradient(circle, #6A56AD44 0%, #2A1D5922 55%, transparent 75%)' },
  // 4: Baby & mother care (Pinkish/Soft)
  { a: 'radial-gradient(circle, #7A2C58 0%, #AA5E8955 45%, transparent 72%)',
    b: 'radial-gradient(circle, #3D152B 0%, #59203F77 50%, transparent 78%)',
    c: 'radial-gradient(circle, #AA5E8944 0%, #59203F22 55%, transparent 75%)' },
];

// ─── Parallax background layers ─────────────────────────────────────────────
// Each blob/layer has a "depth" factor controlling how much it shifts with mouse
const BG_LAYERS = [
  // depth: higher = moves more (closer to viewer)
  { id: 'a', depth: 0.04, className: 'mesh-blob mesh-blob-a', themeKey: 'a' as const },
  { id: 'b', depth: 0.025, className: 'mesh-blob mesh-blob-b', themeKey: 'b' as const },
  { id: 'c', depth: 0.055, className: 'mesh-blob mesh-blob-c', themeKey: 'c' as const },
];

const PILL_PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  depth: 0.02 + (i % 4) * 0.018,
  width: 22 + (i % 4) * 10,
  top: 6 + i * 6.5,
  left: 2 + i * 7,
  opacity: 0.10 + (i % 3) * 0.04,
  rotate: -50 + i * 22,
  duration: 7 + i * 1.2,
  delay: i * 0.45,
}));

// ─── Interactive Background ──────────────────────────────────────────────────
function InteractiveBg({ mouseX, mouseY, taglineIndex }: { mouseX: number; mouseY: number; taglineIndex: number }) {
  const currentTheme = THEMES[taglineIndex] || THEMES[0];

  return (
    <div className="hero-mesh absolute inset-0 pointer-events-none" aria-hidden>
      {/* Mesh blobs with parallax */}
      {BG_LAYERS.map((layer) => (
        <motion.div
          key={layer.id}
          className={layer.className}
          animate={{
            x: mouseX * layer.depth * -1,
            y: mouseY * layer.depth * -1,
            background: currentTheme[layer.themeKey],
          }}
          transition={{
            x: { type: 'spring', stiffness: 60, damping: 22, mass: 1.2 },
            y: { type: 'spring', stiffness: 60, damping: 22, mass: 1.2 },
            background: { duration: 1.2, ease: 'easeInOut' },
          }}
        />
      ))}

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(95,168,156,1) 1px,transparent 1px),linear-gradient(90deg,rgba(95,168,156,1) 1px,transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Pill particles with varied parallax depths */}
      {PILL_PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full border border-petrol-300/25"
          style={{
            width: p.width,
            height: 10,
            top: `${p.top}%`,
            left: `${p.left}%`,
            opacity: p.opacity,
            backgroundColor: 'rgba(95,168,156,0.12)',
            rotate: p.rotate,
          }}
          animate={{
            y: [0, -(8 + p.id * 1.5), 0, mouseY * p.depth * -0.6],
            x: mouseX * p.depth * -0.6,
            rotate: [p.rotate, p.rotate + 10, p.rotate],
          }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay },
            x: { type: 'spring', stiffness: 50, damping: 20 },
          }}
        />
      ))}

      {/* Radial vignette so edges stay dark */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(10,27,24,0.55) 100%)',
        }}
      />
    </div>
  );
}

// ─── HERO ────────────────────────────────────────────────────────────────────
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  // Raw mouse pos relative to section center (in px)
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const smoothX = useSpring(rawX, { stiffness: 55, damping: 20 });
  const smoothY = useSpring(rawY, { stiffness: 55, damping: 20 });
  const [mx, setMx] = useState(0);
  const [my, setMy] = useState(0);

  // Subscribe spring values so we can pass numbers to children
  useEffect(() => {
    const unsubX = smoothX.on('change', setMx);
    const unsubY = smoothY.on('change', setMy);
    return () => { unsubX(); unsubY(); };
  }, [smoothX, smoothY]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      rawX.set(e.clientX - rect.left - rect.width / 2);
      rawY.set(e.clientY - rect.top - rect.height / 2);
    },
    [rawX, rawY]
  );

  const handleMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  // Cycling tagline
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [taglineVisible, setTaglineVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setTaglineVisible(false);
      setTimeout(() => {
        setTaglineIndex((i) => (i + 1) % TAGLINES.length);
        setTaglineVisible(true);
      }, 320);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative bg-ink overflow-hidden pt-8 pb-20 lg:pt-12 lg:pb-24"
    >
      {/* ── Interactive parallax background ─────────────────────────── */}
      <InteractiveBg mouseX={mx} mouseY={my} taglineIndex={taglineIndex} />

      {/* ── Content — centered single column ────────────────────────── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center lg:items-start lg:text-left gap-6">

        {/* Headline */}
        <h1
          className="font-display font-extrabold text-porcelain tracking-tighter leading-[1.04]"
          style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)' }}
        >
          {['Your', 'health,'].map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.1, duration: 0.55, ease }}
              className="inline-block mr-4"
            >
              {word}
            </motion.span>
          ))}
          <br />
          <motion.span
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34, duration: 0.55, ease }}
            className="inline-block text-transparent bg-clip-text"
            style={{
              backgroundImage: 'linear-gradient(135deg,#5FA89C 0%,#a8d8d0 45%,#5FA89C 100%)',
            }}
          >
            delivered.
          </motion.span>
        </h1>

        {/* Cycling tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-lg text-porcelain/58 leading-relaxed max-w-xl"
        >
          Genuine medicines for{' '}
          <span
            className="text-petrol-300 font-semibold transition-opacity duration-300"
            style={{ opacity: taglineVisible ? 1 : 0 }}
          >
            {TAGLINES[taglineIndex]}
          </span>
          {' '}— shipped same-day across Kenya.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.62, duration: 0.5, ease }}
          className="flex flex-wrap justify-center gap-3 lg:justify-start"
        >
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 bg-signal hover:bg-signal/90 active:scale-[0.97] text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-[0_8px_28px_-4px_rgba(255,106,77,0.5)] hover:shadow-[0_14px_36px_-4px_rgba(255,106,77,0.65)] hover:-translate-y-0.5"
          >
            Shop now
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href={`https://wa.me/${branding.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-2 border-porcelain/20 text-porcelain hover:bg-porcelain/10 hover:border-porcelain/35 font-semibold px-8 py-3.5 rounded-2xl transition-all backdrop-blur-sm"
          >
            <MessageCircle size={17} className="text-whatsapp" />
            Talk to pharmacist
          </a>
        </motion.div>



        {/* Category pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          className="flex flex-wrap justify-center lg:justify-start gap-2 pt-1"
        >
          {CATEGORY_PILLS.map((pill) => (
            <Link
              key={pill.slug}
              href={pill.slug ? `/category/${pill.slug}` : '/products'}
              className="text-xs font-medium px-4 py-1.5 rounded-full border border-porcelain/14 text-porcelain/50 hover:border-petrol-300/50 hover:text-porcelain/85 hover:bg-petrol/20 backdrop-blur-sm transition-all"
            >
              {pill.label}
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
