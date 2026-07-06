'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const ease = [0.16, 1, 0.3, 1] as const;

// ─── Brand definitions with clearbit domains ─────────────────────
const BRANDS = [
  { slug: 'panadol', name: 'Panadol', domain: 'panadol.com', color: '#E4002B', bg: '#fff5f5' },
  { slug: 'hedex', name: 'Hedex', domain: 'gsk.com', color: '#003087', bg: '#f0f4ff' },
  { slug: 'brufen', name: 'Brufen', domain: 'abbott.com', color: '#FF6600', bg: '#fff8f0' },
  { slug: 'actifed', name: 'Actifed', domain: 'jnj.com', color: '#009CDE', bg: '#f0faff' },
  { slug: 'strepsils', name: 'Strepsils', domain: 'strepsils.com', color: '#D4002A', bg: '#fff5f5' },
  { slug: 'centrum', name: 'Centrum', domain: 'centrum.com', color: '#003DA5', bg: '#f0f4ff' },
  { slug: 'cerave', name: 'CeraVe', domain: 'cerave.com', color: '#00A0AF', bg: '#f0fafb' },
  { slug: 'cetaphil', name: 'Cetaphil', domain: 'cetaphil.com', color: '#005EB8', bg: '#f0f6ff' },
  { slug: 'johnsons', name: "Johnson's", domain: 'johnsonsbaby.com', color: '#CC0000', bg: '#fff5f5' },
  { slug: 'gaviscon', name: 'Gaviscon', domain: 'gaviscon.com', color: '#0066B3', bg: '#f0f6ff' },
  { slug: 'canesten', name: 'Canesten', domain: 'canesten.com', color: '#7B3FA0', bg: '#faf0ff' },
  { slug: 'gsk', name: 'GSK', domain: 'gsk.com', color: '#F36633', bg: '#fff8f5' },
];

function BrandTile({ brand }: { brand: typeof BRANDS[0] }) {
  const logoUrl = `https://logo.clearbit.com/${brand.domain}`;
  
  return (
    <div className="flex-shrink-0 mx-3 group cursor-pointer select-none" style={{ width: 140 }}>
      <div className="relative rounded-2xl border border-line/70 overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:border-transparent group-hover:-translate-y-1" style={{ background: brand.bg, height: 110 }}>
        
        {/* Silhouette background (brightness 0 + tinted to brand color via sepia/hue trick, or just opacity) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none p-4" style={{ filter: 'brightness(0)' }}>
           <Image src={logoUrl} alt={`${brand.name} silhouette`} fill className="object-contain p-2" unoptimized />
        </div>

        {/* Wordmark placeholder if silhouette is too faint */}
        <div className="absolute top-3 left-0 w-full text-center z-10">
          <span className="font-display font-black tracking-tight text-xs uppercase" style={{ color: brand.color }}>
            {brand.name}
          </span>
        </div>

        {/* Official logo mark */}
        <div className="absolute bottom-3 left-0 w-full flex items-center justify-center z-20 px-4 h-12">
          <div className="relative w-full h-full">
            <Image src={logoUrl} alt={`${brand.name} logo`} fill className="object-contain drop-shadow-sm" unoptimized />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BrandsRail() {
  const doubled = [...BRANDS, ...BRANDS];

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 bg-porcelain overflow-hidden">
      <div className="max-w-7xl mx-auto mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }}>
          <p className="font-mono text-xs uppercase tracking-widest text-petrol-300 mb-1">Our Brands</p>
          <h2 className="font-display font-bold text-2xl text-ink tracking-tight">Trusted names</h2>
        </motion.div>
      </div>

      <div className="overflow-hidden">
        <div className="flex brand-rail" style={{ width: 'max-content' }}>
          {doubled.map((brand, i) => (
            <BrandTile key={`${brand.slug}-${i}`} brand={brand} />
          ))}
        </div>
      </div>
    </section>
  );
}
