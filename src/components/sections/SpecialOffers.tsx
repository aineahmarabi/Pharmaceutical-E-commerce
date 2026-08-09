'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { toProduct } from '@/lib/adapters/product';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

const ease = [0.16, 1, 0.3, 1] as const;

function useCountdown(targetMs: number | null) {
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    if (targetMs === null) {
      setMs(null);
      return;
    }
    setMs(targetMs - Date.now());
    const interval = setInterval(() => setMs(targetMs - Date.now()), 1000);
    return () => clearInterval(interval);
  }, [targetMs]);

  if (ms === null) return null;
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-mono font-bold text-sm bg-ink text-paper rounded-lg px-2 py-1 min-w-[2.25rem] text-center">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[9px] text-petrol-300 uppercase tracking-wide mt-1">{label}</span>
    </div>
  );
}

export function SpecialOffers() {
  const offers = useQuery(api.products.listOffers, { limit: 6 });
  const soonestEndsAt = offers?.reduce<number | null>((soonest, p: any) => {
    if (!p.offerEndsAt) return soonest;
    return soonest === null ? p.offerEndsAt : Math.min(soonest, p.offerEndsAt);
  }, null) ?? null;
  const countdown = useCountdown(soonestEndsAt);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-amber/5">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-3">
            <Flame size={22} className="text-signal" />
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-petrol-300 mb-0.5">Limited time</p>
              <h2 className="font-display font-bold text-2xl text-ink tracking-tight">Special Offers</h2>
            </div>
          </div>
          {countdown && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-petrol-300 mr-1">Ends in</span>
              <CountdownUnit value={countdown.hours} label="hrs" />
              <span className="font-mono text-ink pb-4">:</span>
              <CountdownUnit value={countdown.minutes} label="min" />
              <span className="font-mono text-ink pb-4">:</span>
              <CountdownUnit value={countdown.seconds} label="sec" />
            </div>
          )}
        </motion.div>

        {offers === undefined ? (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-52">
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : offers.length === 0 ? (
          <EmptyState title="No offers right now" description="Check back soon for limited-time deals." />
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {offers.map((p) => (
              <div key={p._id} className="flex-shrink-0 w-52">
                <ProductCard product={toProduct(p)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
