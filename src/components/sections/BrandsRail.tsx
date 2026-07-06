'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import Link from 'next/link';

const ease = [0.16, 1, 0.3, 1] as const;

// Helper to generate a consistent color from string
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 70%, 95%)`;
}
function stringToDarkColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 70%, 25%)`;
}

function BrandTile({ brand }: { brand: any }) {
  const bg = stringToColor(brand.name);
  const color = stringToDarkColor(brand.name);
  
  return (
    <Link href={`/brand/${brand.slug}`} className="flex-shrink-0 mx-3 group cursor-pointer select-none block" style={{ width: 140 }}>
      <div className="relative rounded-2xl border border-line/70 overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:border-transparent group-hover:-translate-y-1" style={{ background: bg, height: 110 }}>
        
        {/* Wordmark placeholder */}
        <div className="absolute top-3 left-0 w-full text-center z-10 px-2">
          <span className="font-display font-black tracking-tight text-xs uppercase truncate block" style={{ color: color }}>
            {brand.name}
          </span>
        </div>

        {/* Official logo mark */}
        {brand.imageUrl && (
          <div className="absolute bottom-3 left-0 w-full flex items-center justify-center z-20 px-4 h-12">
            <div className="relative w-full h-full">
              <Image src={brand.imageUrl} alt={`${brand.name} logo`} fill className="object-contain drop-shadow-sm" unoptimized />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

export function BrandsRail() {
  const brands = useQuery(api.brands.list);

  // Still loading or no brands yet
  if (brands === undefined || brands.length === 0) {
    return null; // hide section if no brands exist
  }

  // Duplicate for infinite scroll effect if needed, or just display them
  const doubled = [...brands, ...brands, ...brands, ...brands].slice(0, 12);

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
            <BrandTile key={`${brand._id || brand.slug}-${i}`} brand={brand} />
          ))}
        </div>
      </div>
    </section>
  );
}
