'use client';

import React, { useRef } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;

const stats = [
  { value: 60, suffix: '+', label: 'Stores nationwide' },
  { value: 2000, suffix: '+', label: 'Products available' },
  { value: 30, suffix: ' min', label: 'Avg delivery time' },
  { value: 100, suffix: '%', label: 'Genuine guarantee' },
];

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const mv = useMotionValue(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      const controls = animate(mv, value, { duration: 1.2, ease: [0.16, 1, 0.3, 1] });
      return controls.stop;
    }
  }, [inView, mv, value]);

  const display = useTransform(mv, (v) => `${Math.floor(v)}${suffix}`);

  return <motion.span ref={ref}>{display}</motion.span>;
}

export function TrustBar() {
  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 bg-porcelain">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="bg-petrol rounded-3xl px-8 py-8"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-porcelain/20">
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex flex-col items-center justify-center py-6 lg:py-0 px-6 text-center">
                <span className="font-mono text-3xl font-bold text-porcelain">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </span>
                <span className="text-sm text-petrol-300 font-medium mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
