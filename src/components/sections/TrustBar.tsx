'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle, Truck, Smartphone, Headphones } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

const signals = [
  { icon: ShieldCheck, label: 'Licensed pharmacy' },
  { icon: CheckCircle, label: 'Genuine products' },
  { icon: Truck, label: 'Fast, discreet delivery' },
  { icon: Smartphone, label: 'M-Pesa & cash on delivery' },
  { icon: Headphones, label: 'Pharmacist support' },
];

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
          <div className="grid grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-porcelain/20">
            {signals.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center justify-center gap-2 py-6 lg:py-0 px-4 text-center">
                <Icon size={22} className="text-petrol-300" />
                <span className="text-sm text-porcelain font-medium">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
