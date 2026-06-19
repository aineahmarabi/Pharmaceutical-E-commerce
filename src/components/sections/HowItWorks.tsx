'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingBag, Truck } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

const steps = [
  { icon: Search, title: 'Browse & search', body: 'Search 2,000+ medicines by name, brand, or condition. Filter by category and price.' },
  { icon: ShoppingBag, title: 'Add to cart', body: 'Add your items, review your order, and apply any promo codes.' },
  { icon: Truck, title: 'Get it delivered', body: 'Same-day delivery in Nairobi. Pick-up available at all branches.' },
];

export function HowItWorks() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-porcelain">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="text-center mb-12"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-petrol-300 mb-2">How it works</p>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-ink tracking-tight">Order in 3 easy steps</h2>
        </motion.div>

        <div className="relative flex flex-col md:flex-row gap-8 items-start">
          {/* Connecting dashed line on desktop */}
          <svg className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] w-3/4" height="2" viewBox="0 0 100 2" preserveAspectRatio="none">
            <motion.line
              x1="0" y1="1" x2="100" y2="1"
              stroke="#0E4D45"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              strokeOpacity="0.3"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease }}
            />
          </svg>

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5, ease }}
                className="flex-1 flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-full bg-petrol flex items-center justify-center mb-5 relative z-10">
                  <Icon size={28} className="text-paper" />
                  <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-signal flex items-center justify-center font-mono font-bold text-sm text-paper">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-ink mb-2">{step.title}</h3>
                <p className="text-sm text-ink/60 leading-relaxed max-w-xs">{step.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
