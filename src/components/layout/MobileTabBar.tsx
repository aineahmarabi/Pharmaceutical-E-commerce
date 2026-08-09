'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Search, ShoppingCart, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore, useWishlistStore } from '@/store/cart';
import { useScrollDirection } from '@/hooks/useScrollDirection';

const tabs = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Categories', href: '/products', icon: LayoutGrid },
  { label: 'Search', href: '/search', icon: Search },
  { label: 'Cart', href: '/cart', icon: ShoppingCart },
  { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();
  const { items } = useCartStore();
  const { ids } = useWishlistStore();
  const cartCount = items.reduce((n, i) => n + i.quantity, 0);
  const wishCount = ids.size;
  const direction = useScrollDirection();

  return (
    <motion.nav
      animate={{ y: direction === 'down' ? '100%' : '0%' }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-paper border-t border-line/60 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {tabs.map(({ label, href, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
                active ? 'text-petrol' : 'text-petrol-300'
              )}
            >
              <span className="relative">
                <Icon size={20} strokeWidth={active ? 2.25 : 1.75} />
                {label === 'Cart' && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-[3px] rounded-full bg-signal text-paper text-[9px] font-bold flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
                {label === 'Wishlist' && wishCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-[3px] rounded-full bg-signal text-paper text-[9px] font-bold flex items-center justify-center">
                    {wishCount > 9 ? '9+' : wishCount}
                  </span>
                )}
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
