'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCartStore, useWishlistStore } from '@/store/cart';
import { useScrollDirection } from '@/hooks/useScrollDirection';

// Text-led tabs: labels carry the meaning, no decorative icons.
const tabs = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/products' },
  { label: 'Search', href: '/search' },
  { label: 'Cart', href: '/cart' },
  { label: 'Saved', href: '/account/wishlist' },
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
      aria-label="Quick navigation"
      animate={{ y: direction === 'down' ? '100%' : '0%' }}
      transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/90 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <div className="grid grid-cols-5">
        {tabs.map(({ label, href }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          const count = label === 'Cart' ? cartCount : label === 'Saved' ? wishCount : 0;
          return (
            <Link
              key={href}
              href={href}
              data-cart-target={label === 'Cart' ? '' : undefined}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex h-14 items-center justify-center text-xs transition-transform duration-100 active:scale-[0.97]',
                active ? 'font-semibold text-petrol' : 'font-medium text-muted-fg',
              )}
            >
              {active && <span className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-petrol" />}
              <span className="relative">
                {label}
                {count > 0 && (
                  <span className="absolute -right-4 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-petrol px-1 text-[10px] font-semibold tabular-nums text-white">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
