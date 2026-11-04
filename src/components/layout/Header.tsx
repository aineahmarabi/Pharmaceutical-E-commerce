'use client';

import { AccountReminderDot } from '@/components/account/RefillReminder';
import { ThemeToggle } from './ThemeToggle';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CircleUser, Heart, ShoppingBag, ChevronDown, X, Menu, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBranding } from '@/hooks/useBranding';
import { categories } from '@/lib/fixtures/categories';
import { useCartStore, useWishlistStore } from '@/store/cart';
import { SearchOverlay } from '@/components/search/SearchOverlay';
import { Logo } from '@/components/layout/Logo';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const sheetSpring = { type: 'spring', bounce: 0, duration: 0.35 } as const;

const promos = [
  'Fast, discreet delivery across Kenya',
  'Talk to a pharmacist via WhatsApp',
  'Genuine medicines, sourced from licensed manufacturers',
];

const CATEGORY_GROUPS: Record<string, string[]> = {
  'Everyday health': ['pain-relief', 'cough-cold', 'allergy', 'digestive-health'],
  'Prescription and chronic care': ['antibiotics', 'antimalarial', 'anti-infective', 'cardiovascular', 'arthritis-joint-care', 'respiratory', 'antifungal'],
  'Family and wellness': ['baby-care', 'mother-baby', 'skin-care', 'vitamins-supplements', 'sexual-wellness'],
};

const quickLinks = [
  { label: 'New arrivals', href: '/new-arrivals' },
  { label: 'Trending', href: '/trending' },
  { label: 'Best sellers', href: '/best-sellers' },
  { label: 'Special offers', href: '/offers' },
  { label: 'All products', href: '/products' },
];

const colHeading = 'mb-3 text-xs font-semibold text-muted-fg';
const megaLink = 'block rounded-lg px-2 py-1.5 text-sm text-ink transition-colors hover:bg-porcelain hover:text-petrol';

function CategoriesMega() {
  const liveCategories = useQuery(api.taxonomy.listCategories, {});
  const source = liveCategories && liveCategories.length > 0 ? liveCategories : categories;
  const groupNames = Object.keys(CATEGORY_GROUPS);

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-4 gap-8 px-8 py-6">
      {groupNames.map((group) => (
        <div key={group} className="min-w-0">
          <p className={colHeading}>{group}</p>
          <ul>
            {source.filter((c) => CATEGORY_GROUPS[group].includes(c.slug)).map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className={megaLink}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="min-w-0 border-l border-line pl-8">
        <p className={colHeading}>Browse</p>
        <ul>
          {quickLinks.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={megaLink}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ConditionsMega() {
  const queryResult = useQuery(api.taxonomy.listConditions, {});
  const conditions = Array.isArray(queryResult) ? queryResult : [];

  return (
    <div className="mx-auto max-w-7xl px-8 py-6">
      <p className={colHeading}>Shop by condition</p>
      {conditions.length === 0 ? (
        <p className="text-sm text-muted-fg">Conditions will appear here soon.</p>
      ) : (
        <ul className="grid grid-cols-4 gap-x-8">
          {conditions.slice(0, 16).map((c) => (
            <li key={c.slug}>
              <Link href={`/search?q=${encodeURIComponent(c.name)}`} className={megaLink}>{c.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BrandsMega() {
  const queryResult = useQuery(api.brands.list);
  const allBrands = Array.isArray(queryResult) ? queryResult : [];

  return (
    <div className="mx-auto max-w-7xl px-8 py-6">
      <p className={colHeading}>Brands</p>
      {allBrands.length === 0 ? (
        <p className="text-sm text-muted-fg">No brands yet.</p>
      ) : (
        <ul className="grid grid-cols-4 gap-x-8">
          {allBrands.slice(0, 16).map((b) => (
            <li key={b.slug} className="min-w-0">
              <Link href={`/brand/${b.slug}`} className={cn(megaLink, 'truncate')}>{b.name}</Link>
            </li>
          ))}
        </ul>
      )}
      <Link href="/products" className="mt-4 inline-flex items-center gap-1 px-2 text-sm font-medium text-petrol hover:underline underline-offset-4">
        View all products <ArrowRight size={14} />
      </Link>
    </div>
  );
}

const megaComponents = {
  categories: CategoriesMega,
  conditions: ConditionsMega,
  brands: BrandsMega,
};

const iconBtn =
  'relative flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-transform duration-100 hover:bg-porcelain active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40';

function CountBadge({ n }: { n: number }) {
  return (
    <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-petrol px-1 text-[10px] font-semibold tabular-nums text-white">
      {n > 99 ? '99+' : n}
    </span>
  );
}

export function Header() {
  const [promoIdx, setPromoIdx] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const megaTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pathname = usePathname();
  const { items, toggleCart } = useCartStore();
  const { ids } = useWishlistStore();
  const cartCount = items.reduce((n, i) => n + i.quantity, 0);
  const wishCount = ids.size;
  const branding = useBranding();
  const liveCategories = useQuery(api.taxonomy.listCategories, {});
  const mobileCategories = liveCategories && liveCategories.length > 0 ? liveCategories : categories;
  const deliveryZones = useQuery(api.delivery.listZones);
  const [zoneShowcaseIdx, setZoneShowcaseIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPromoIdx((i) => (i + 1) % promos.length), 4200);
    return () => clearInterval(t);
  }, []);

  // Purely decorative: keeps cycling through the areas we deliver to.
  // Actual zone selection happens at checkout.
  useEffect(() => {
    if (!deliveryZones || deliveryZones.length < 2) return;
    const t = setInterval(() => setZoneShowcaseIdx((i) => (i + 1) % deliveryZones.length), 3000);
    return () => clearInterval(t);
  }, [deliveryZones]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        // Hysteresis avoids flicker around a single threshold.
        setScrolled((prev) => (prev ? window.scrollY > 40 : window.scrollY > 80));
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onSlash = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      e.preventDefault();
      setSearchOpen(true);
    };
    window.addEventListener('keydown', onSlash);
    return () => window.removeEventListener('keydown', onSlash);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close menus on route change
    setMobileMenuOpen(false);
    setActiveMega(null);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen && !activeMega) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setActiveMega(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen, activeMega]);

  const openMega = (key: string) => {
    clearTimeout(megaTimerRef.current);
    setActiveMega(key);
  };
  const closeMegaDelayed = () => {
    megaTimerRef.current = setTimeout(() => setActiveMega(null), 180);
  };

  const navItems = [
    { label: 'Categories', key: 'categories' },
    { label: 'Conditions', key: 'conditions' },
    { label: 'Brands', key: 'brands' },
    { label: 'New arrivals', href: '/new-arrivals' },
    { label: 'Trending', href: '/trending' },
    { label: 'Best sellers', href: '/best-sellers' },
    { label: 'Offers', href: '/offers' },
  ];

  const zoneName = deliveryZones?.[zoneShowcaseIdx % (deliveryZones.length || 1)]?.name ?? 'Nationwide';

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-petrol focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>
      <header className={cn('sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur transition-shadow duration-200', scrolled && 'shadow-sm')}>
        {/* Utility strip */}
        <AnimatePresence initial={false}>
          {!scrolled && (
            <motion.div
              initial={{ height: 32, opacity: 1 }}
              animate={{ height: 32, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={sheetSpring}
              className="overflow-hidden bg-deep"
            >
              <div className="mx-auto flex h-8 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <p className="hidden shrink-0 text-xs text-on-deep/70 md:block">
                  Delivering to{' '}
                  <span className="inline-block min-w-24 font-medium text-on-deep" aria-live="off">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={`zone-${zoneShowcaseIdx}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="inline-block"
                      >
                        {zoneName}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </p>
                <div className="flex flex-1 justify-center">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={promoIdx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="truncate text-xs font-medium text-on-deep/90"
                    >
                      {promos[promoIdx]}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <div className="hidden shrink-0 items-center gap-5 text-xs text-on-deep/70 md:flex">
                  <Link href="/account/orders" className="transition-colors hover:text-on-deep">Track order</Link>
                  <a href={`tel:${branding.phone}`} className="tabular-nums transition-colors hover:text-on-deep">{branding.phone}</a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main row */}
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center gap-3 px-4 sm:px-6 lg:gap-8 lg:px-8">
          <button className={cn(iconBtn, 'md:hidden')} onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
            <Menu size={21} />
          </button>

          <Logo size="md" />

          <div className="hidden max-w-xl flex-1 md:block">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="group flex h-12 w-full items-center gap-3 rounded-full border border-line bg-porcelain pl-5 pr-2 text-left text-muted-fg shadow-sm transition-[colors,box-shadow] hover:border-petrol/50 hover:bg-paper hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40"
              aria-label="Search medicines, brands and conditions"
            >
              <Search size={18} className="shrink-0 text-ink" />
              <span className="flex-1 truncate text-sm">What do you need today?</span>
              <kbd className="hidden h-8 min-w-8 items-center justify-center rounded-full border border-line bg-paper px-2.5 text-xs font-medium text-muted-fg lg:inline-flex">/</kbd>
            </button>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/prescription"
              className="mr-2 hidden h-10 items-center rounded-full border border-line px-4 text-sm font-medium text-ink transition-transform duration-100 hover:border-petrol hover:text-petrol active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40 lg:inline-flex"
            >
              Send prescription
            </Link>
            <button type="button" onClick={() => setSearchOpen(true)} className={cn(iconBtn, 'md:hidden')} aria-label="Search">
              <Search size={20} />
            </button>
            <Link href="/account" className={cn(iconBtn, 'relative')} aria-label="Account">
              <CircleUser size={20} />
              <AccountReminderDot />
            </Link>
            <Link href="/account/wishlist" className={cn(iconBtn, 'hidden md:flex')} aria-label={`Wishlist${wishCount ? `, ${wishCount} items` : ''}`}>
              <Heart size={20} />
              {wishCount > 0 && <CountBadge n={wishCount} />}
            </Link>
            <ThemeToggle />
            <button type="button" data-cart-target onClick={toggleCart} className={cn(iconBtn, 'hidden md:flex')} aria-label={`Cart${cartCount ? `, ${cartCount} items` : ''}`}>
              <ShoppingBag size={20} />
              {cartCount > 0 && <CountBadge n={cartCount} />}
            </button>
          </div>
        </div>

        {/* Nav + mega-menu */}
        <nav aria-label="Primary" className="relative hidden border-t border-line/60 md:block" onMouseLeave={closeMegaDelayed}>
          <div className="mx-auto flex h-12 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
            {navItems.map((item) => {
              if ('key' in item && item.key) {
                const key = item.key;
                const open = activeMega === key;
                return (
                  <button
                    key={item.label}
                    type="button"
                    aria-expanded={open}
                    aria-haspopup="true"
                    onMouseEnter={() => openMega(key)}
                    onFocus={() => openMega(key)}
                    onClick={() => (open ? setActiveMega(null) : openMega(key))}
                    className={cn(
                      'flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40',
                      open ? 'bg-porcelain text-petrol' : 'text-ink hover:bg-porcelain',
                    )}
                  >
                    {item.label}
                    <ChevronDown size={14} className={cn('transition-transform duration-200', open && 'rotate-180')} />
                  </button>
                );
              }
              const href = (item as { href: string }).href;
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={item.label}
                  href={href}
                  onMouseEnter={() => setActiveMega(null)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40',
                    isActive ? 'text-petrol' : 'text-ink hover:bg-porcelain',
                    item.label === 'Offers' && !isActive && 'text-signal',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link href="/products" className="ml-auto flex items-center gap-1 text-sm font-medium text-petrol underline-offset-4 hover:underline">
              All products <ArrowRight size={14} />
            </Link>
          </div>

          <AnimatePresence>
            {activeMega && megaComponents[activeMega as keyof typeof megaComponents] && (() => {
              const MegaComponent = megaComponents[activeMega as keyof typeof megaComponents];
              return (
                <motion.div
                  key="mega"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={sheetSpring}
                  className="absolute inset-x-0 top-full z-50 border-b border-line bg-paper shadow-sm"
                  onMouseEnter={() => clearTimeout(megaTimerRef.current)}
                >
                  <MegaComponent />
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-deep/50 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={sheetSpring}
              className="fixed inset-y-0 left-0 z-50 flex w-80 max-w-[88vw] flex-col bg-paper shadow-xl md:hidden"
              aria-label="Menu"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
                <Logo size="md" />
                <button onClick={() => setMobileMenuOpen(false)} className={iconBtn} aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
                <div className="mb-4 grid gap-2">
                  <Link href="/prescription" className="flex h-11 items-center justify-center rounded-lg bg-petrol text-sm font-medium text-white transition-transform duration-100 hover:bg-petrol-700 active:scale-[0.97]">
                    Send prescription
                  </Link>
                  <Link href="/account/orders" className="flex h-11 items-center justify-center rounded-lg border border-line text-sm font-medium text-ink transition-transform duration-100 hover:bg-porcelain active:scale-[0.97]">
                    Track order
                  </Link>
                </div>
                <p className="mb-1 px-2 text-xs font-semibold text-muted-fg">Categories</p>
                <ul className="mb-4">
                  {mobileCategories.map((cat) => (
                    <li key={cat.slug}>
                      <Link href={`/category/${cat.slug}`} className="block rounded-lg px-2 py-2.5 text-sm text-ink transition-colors hover:bg-porcelain hover:text-petrol">
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-line pt-4">
                  <p className="mb-1 px-2 text-xs font-semibold text-muted-fg">Shop</p>
                  <ul>
                    {quickLinks.map((item) => (
                      <li key={item.href}>
                        <Link href={item.href} className="block rounded-lg px-2 py-2.5 text-sm text-ink transition-colors hover:bg-porcelain hover:text-petrol">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="shrink-0 border-t border-line px-4 py-3 text-xs text-muted-fg">
                Need help? Call <a href={`tel:${branding.phone}`} className="font-medium tabular-nums text-ink">{branding.phone}</a>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
