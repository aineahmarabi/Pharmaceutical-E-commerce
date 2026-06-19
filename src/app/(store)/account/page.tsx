'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, MapPin, User, ChevronRight } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

const tiles = [
  { icon: ShoppingBag, title: 'My orders', sub: 'Track and manage your orders', href: '/account/orders' },
  { icon: Heart, title: 'Wishlist', sub: 'Saved products', href: '/account/wishlist' },
  { icon: MapPin, title: 'Addresses', sub: 'Delivery addresses', href: '/account/addresses' },
  { icon: User, title: 'Profile', sub: 'Edit personal details', href: '/account/profile' },
];

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-porcelain py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          <p className="font-mono text-xs uppercase tracking-widest text-petrol-300 mb-1">Account</p>
          <h1 className="font-display font-bold text-2xl text-ink tracking-tight">Welcome back</h1>
        </motion.div>

        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          {tiles.map(({ icon: Icon, title, sub, href }, i) => (
            <motion.div
              key={href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4, ease }}
            >
              <Link
                href={href}
                className="flex items-center gap-4 p-5 bg-paper rounded-2xl border border-line hover:border-petrol transition-all hover:-translate-y-0.5 hover:shadow-md group"
              >
                <div className="w-12 h-12 rounded-xl bg-petrol-50 flex items-center justify-center group-hover:bg-petrol transition-colors">
                  <Icon size={20} className="text-petrol group-hover:text-paper transition-colors" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-ink">{title}</p>
                  <p className="text-xs text-petrol-300">{sub}</p>
                </div>
                <ChevronRight size={16} className="text-petrol-300 group-hover:text-petrol transition-colors" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
