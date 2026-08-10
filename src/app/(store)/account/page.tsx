'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, MapPin, User, ChevronRight, LogOut } from 'lucide-react';
import { useCustomerAuth } from '@/lib/auth/customerAuth';

const ease = [0.16, 1, 0.3, 1] as const;

const tiles = [
  { icon: ShoppingBag, title: 'My orders', sub: 'Track and manage your orders', href: '/account/orders' },
  { icon: Heart, title: 'Wishlist', sub: 'Saved products', href: '/account/wishlist' },
  { icon: MapPin, title: 'Addresses', sub: 'Delivery addresses', href: '/account/addresses' },
  { icon: User, title: 'Profile', sub: 'Edit personal details', href: '/account/profile' },
];

export default function AccountPage() {
  const { customer, isAuthenticated, logout } = useCustomerAuth();

  return (
    <div className="min-h-screen bg-porcelain py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          <p className="font-mono text-xs uppercase tracking-widest text-petrol-300 mb-1">Account</p>
          {isAuthenticated ? (
            <div className="flex items-center justify-between gap-4">
              <h1 className="font-display font-bold text-2xl text-ink tracking-tight">Welcome back, {customer?.name?.split(' ')[0]}</h1>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-xs font-semibold text-ink/50 hover:text-danger transition-colors flex-shrink-0"
              >
                <LogOut size={14} />Log out
              </button>
            </div>
          ) : (
            <h1 className="font-display font-bold text-2xl text-ink tracking-tight">Welcome</h1>
          )}
        </motion.div>

        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.4, ease }}
            className="mt-4 bg-paper rounded-2xl border border-line p-5 flex flex-wrap items-center justify-between gap-4"
          >
            <div>
              <p className="text-sm font-semibold text-ink">Browsing as a guest</p>
              <p className="text-xs text-ink/50 mt-0.5">An account is optional — sign up to save your profile, addresses, and order history.</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/account/login" className="text-sm font-semibold text-petrol border border-petrol/30 hover:bg-petrol-50 rounded-xl px-4 py-2 transition-colors">
                Log in
              </Link>
              <Link href="/account/signup" className="text-sm font-semibold bg-petrol hover:bg-petrol-700 text-paper rounded-xl px-4 py-2 transition-colors">
                Sign up
              </Link>
            </div>
          </motion.div>
        )}

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
