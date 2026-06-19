'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock } from 'lucide-react';
import { branding } from '@/lib/config/branding';

const ease = [0.16, 1, 0.3, 1] as const;

const stores = [
  { id: 1, name: 'Westlands Branch', address: '14 Waiyaki Way, Westlands', city: 'Nairobi', phone: '0712 100 001', hours: 'Mon–Sat 7am–9pm, Sun 9am–6pm' },
  { id: 2, name: 'CBD Branch', address: 'Kimathi Street, CBD', city: 'Nairobi', phone: '0712 100 002', hours: 'Mon–Fri 7am–8pm, Sat 8am–6pm' },
  { id: 3, name: 'Karen Branch', address: 'Karen Shopping Centre', city: 'Nairobi', phone: '0712 100 003', hours: 'Daily 8am–9pm' },
  { id: 4, name: 'Mombasa Branch', address: 'Nyali Centre, Mombasa', city: 'Mombasa', phone: '0712 100 004', hours: 'Mon–Sat 8am–8pm' },
  { id: 5, name: 'Kisumu Branch', address: 'Mega City Mall, Kisumu', city: 'Kisumu', phone: '0712 100 005', hours: 'Mon–Sat 8am–8pm' },
  { id: 6, name: 'Nakuru Branch', address: 'Westside Mall, Nakuru', city: 'Nakuru', phone: '0712 100 006', hours: 'Mon–Sat 8am–8pm' },
];

export default function StoreLocatorPage() {
  return (
    <div className="min-h-screen bg-porcelain py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          <p className="font-mono text-xs uppercase tracking-widest text-petrol-300 mb-1">Find us</p>
          <h1 className="font-display font-bold text-2xl text-ink tracking-tight">Store Locator</h1>
          <p className="text-petrol-300 text-sm mt-1">60+ branches nationwide. Find the nearest {branding.name} to you.</p>
        </motion.div>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store, i) => (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4, ease }}
              className="bg-paper rounded-2xl border border-line p-5 hover:border-petrol transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-petrol flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} className="text-paper" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-ink">{store.name}</p>
                  <p className="text-xs text-petrol-300 mt-0.5">{store.address}</p>
                  <p className="text-xs text-petrol-300">{store.city}</p>
                </div>
              </div>
              <hr className="border-line my-3" />
              <div className="space-y-1.5">
                <p className="flex items-center gap-2 text-xs text-ink/70">
                  <Phone size={11} className="text-petrol" />{store.phone}
                </p>
                <p className="flex items-center gap-2 text-xs text-ink/70">
                  <Clock size={11} className="text-petrol" />{store.hours}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
