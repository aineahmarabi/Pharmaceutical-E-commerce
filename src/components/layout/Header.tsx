'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, CircleUser, Heart, ShoppingBag, Phone, MapPin,
  ChevronDown, X, Menu, ArrowRight,
  Pill, Wind, Leaf, Sparkles, Baby, Smile, Activity, HeartPulse, Shield,
  Package, Tag, Boxes, Lock, HeartHandshake, Flower2, CircleDot, ShieldCheck, Bug, Droplets, Stethoscope,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBranding } from '@/hooks/useBranding';
import { categories } from '@/lib/fixtures/categories';
import { brands } from '@/lib/fixtures/categories';
import { useCartStore, useWishlistStore } from '@/store/cart';
import { useDeliveryZoneStore } from '@/store/delivery';
import { SearchOverlay } from '@/components/search/SearchOverlay';
import { BrandName } from '@/components/ui/BrandName';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const ease = [0.16, 1, 0.3, 1] as const;

const promos = [
  'Fast, discreet delivery across Kenya',
  'Talk to a pharmacist via WhatsApp',
  'Genuine medicines, sourced from licensed manufacturers',
];

const catIcons: Record<string, React.ElementType> = {
  'pain-fever': Pill, 'cold-flu': Wind, vitamins: Leaf, skincare: Sparkles,
  'baby-mum': Baby, digestive: Smile, diabetes: Activity, 'personal-care': HeartPulse,
  'pain-relief': Pill, antibiotics: Shield, 'cough-cold': Wind, 'baby-care': Baby,
  'skin-care': Sparkles, 'arthritis-joint-care': Activity, 'sexual-wellness': Lock,
  'mother-baby': HeartHandshake, allergy: Flower2, 'vitamins-supplements': Leaf,
  'digestive-health': CircleDot, cardiovascular: HeartPulse, 'anti-infective': ShieldCheck,
  antimalarial: Bug, antifungal: Droplets, respiratory: Stethoscope,
};

const catBg: Record<string, string> = {
  'pain-fever': 'bg-signal/10 text-signal', 'cold-flu': 'bg-info/10 text-info',
  vitamins: 'bg-success/10 text-success', skincare: 'bg-amber/10 text-warning',
  'baby-mum': 'bg-petrol-50 text-petrol', digestive: 'bg-signal/10 text-signal',
  diabetes: 'bg-danger/10 text-danger', 'personal-care': 'bg-success/10 text-success',
  'pain-relief': 'bg-signal/10 text-signal', antibiotics: 'bg-petrol-50 text-petrol',
  'cough-cold': 'bg-info/10 text-info', 'baby-care': 'bg-petrol-50 text-petrol',
  'skin-care': 'bg-amber/10 text-warning', 'arthritis-joint-care': 'bg-danger/10 text-danger',
  'sexual-wellness': 'bg-petrol-50 text-petrol', 'mother-baby': 'bg-petrol-50 text-petrol',
  allergy: 'bg-success/10 text-success', 'vitamins-supplements': 'bg-success/10 text-success',
  'digestive-health': 'bg-signal/10 text-signal', cardiovascular: 'bg-danger/10 text-danger',
  'anti-infective': 'bg-petrol-50 text-petrol', antimalarial: 'bg-success/10 text-success',
  antifungal: 'bg-info/10 text-info', respiratory: 'bg-info/10 text-info',
};

const CATEGORY_GROUPS: Record<string, string[]> = {
  'Everyday Health': ['pain-relief', 'cough-cold', 'allergy', 'digestive-health'],
  'Prescription & Chronic Care': ['antibiotics', 'antimalarial', 'anti-infective', 'cardiovascular', 'arthritis-joint-care', 'respiratory', 'antifungal'],
  'Family & Wellness': ['baby-care', 'mother-baby', 'skin-care', 'vitamins-supplements', 'sexual-wellness'],
};

function CategoriesMega() {
  const liveCategories = useQuery(api.taxonomy.listCategories, {});
  const source = liveCategories && liveCategories.length > 0 ? liveCategories : categories;
  const groupNames = Object.keys(CATEGORY_GROUPS);

  return (
    <div className="max-w-7xl mx-auto px-8 py-7 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_240px] gap-8">
      <div className="min-w-0">
        {groupNames.slice(0, 1).map((group) => (
          <React.Fragment key={group}>
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-petrol-300/70 mb-3">{group}</p>
            <ul className="space-y-0.5">
              {source.filter((c) => CATEGORY_GROUPS[group].includes(c.slug)).map((c) => {
                const Icon = catIcons[c.slug] ?? Pill;
                return (
                  <li key={c.slug}>
                    <Link href={`/category/${c.slug}`} className="flex items-center gap-2.5 px-2 py-2 rounded-xl text-sm text-ink hover:bg-petrol-50 hover:text-petrol transition-colors group">
                      <span className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110', catBg[c.slug] ?? 'bg-petrol-50 text-petrol')}>
                        <Icon size={13} />
                      </span>
                      <span className="font-medium">{c.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </React.Fragment>
        ))}
      </div>
      <div className="min-w-0">
        {groupNames.slice(1, 2).map((group) => (
          <React.Fragment key={group}>
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-petrol-300/70 mb-3">{group}</p>
            <ul className="space-y-0.5">
              {source.filter((c) => CATEGORY_GROUPS[group].includes(c.slug)).map((c) => {
                const Icon = catIcons[c.slug] ?? Pill;
                return (
                  <li key={c.slug}>
                    <Link href={`/category/${c.slug}`} className="flex items-center gap-2.5 px-2 py-2 rounded-xl text-sm text-ink hover:bg-petrol-50 hover:text-petrol transition-colors group">
                      <span className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110', catBg[c.slug] ?? 'bg-petrol-50 text-petrol')}>
                        <Icon size={13} />
                      </span>
                      <span className="font-medium">{c.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </React.Fragment>
        ))}
      </div>
      <div className="min-w-0">
        {groupNames.slice(2, 3).map((group) => (
          <React.Fragment key={group}>
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-petrol-300/70 mb-3">{group}</p>
            <ul className="space-y-0.5">
              {source.filter((c) => CATEGORY_GROUPS[group].includes(c.slug)).map((c) => {
                const Icon = catIcons[c.slug] ?? Pill;
                return (
                  <li key={c.slug}>
                    <Link href={`/category/${c.slug}`} className="flex items-center gap-2.5 px-2 py-2 rounded-xl text-sm text-ink hover:bg-petrol-50 hover:text-petrol transition-colors group">
                      <span className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110', catBg[c.slug] ?? 'bg-petrol-50 text-petrol')}>
                        <Icon size={13} />
                      </span>
                      <span className="font-medium">{c.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </React.Fragment>
        ))}
      </div>
      <div className="min-w-0">
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-petrol-300/70 mb-3">Quick links</p>
        <ul className="space-y-0.5">
          {[
            { label: 'New Arrivals', href: '/new-arrivals', icon: Sparkles },
            { label: 'Trending', href: '/trending', icon: Activity },
            { label: 'Best Sellers', href: '/best-sellers', icon: Tag },
            { label: 'Special Offers', href: '/offers', icon: Pill },
            { label: 'All Products', href: '/products', icon: Package },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link href={item.href} className="flex items-center gap-2.5 px-2 py-2 rounded-xl text-sm text-ink hover:bg-petrol-50 hover:text-petrol transition-colors">
                  <span className="w-7 h-7 rounded-lg bg-petrol-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={13} className="text-petrol" />
                  </span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between flex-shrink-0 w-[240px]">
        <Image src="/images/promo/vitamins.jpg" alt="" fill sizes="240px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a3830]/90 via-[#0E4D45]/45 to-[#0E4D45]/10" />
        <div className="relative z-10 [text-shadow:0_1px_4px_rgba(0,0,0,0.55)]">
          <p className="font-mono text-[10px] uppercase tracking-widest text-petrol-300 mb-2">Featured</p>
          <p className="font-display font-bold text-xl text-paper leading-tight mb-2">Vitamins &amp; Supplements</p>
          <p className="text-xs text-porcelain/90 leading-relaxed">Immune support, omega-3, multivitamins and daily wellness — all in one place.</p>
        </div>
        <Link href="/category/vitamins-supplements" className="relative z-10 mt-5 flex items-center gap-1.5 text-sm font-semibold text-paper hover:text-petrol-300 transition-colors [text-shadow:0_1px_4px_rgba(0,0,0,0.55)]">
          Shop vitamins <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

function BrandsMega() {
  const queryResult = useQuery(api.brands.list);
  const allBrands = Array.isArray(queryResult) ? queryResult : [];
  
  return (
    <div className="max-w-7xl mx-auto px-8 py-7 grid grid-cols-[1fr_1fr_240px] gap-8">
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-petrol-300/70 mb-3">Pharmaceutical Brands</p>
        <div className="grid grid-cols-2 gap-1.5">
          {allBrands.slice(0, 8).map((b) => (
            <Link key={b.slug} href={`/brand/${b.slug}`} className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-sm font-medium text-ink hover:bg-petrol-50 hover:text-petrol transition-colors">
              <span className="w-6 h-6 rounded-md bg-petrol-50 flex items-center justify-center flex-shrink-0">
                <Boxes size={11} className="text-petrol" />
              </span>
              <span className="truncate block max-w-[120px]">{b.name}</span>
            </Link>
          ))}
          {allBrands.length === 0 && <span className="text-sm text-petrol-300">No brands yet.</span>}
        </div>
      </div>
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-petrol-300/70 mb-3">More Brands</p>
        <div className="grid grid-cols-1 gap-1.5">
          {allBrands.slice(8, 14).map((b) => (
            <Link key={b.slug} href={`/brand/${b.slug}`} className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-sm font-medium text-ink hover:bg-petrol-50 hover:text-petrol transition-colors">
              <span className="w-6 h-6 rounded-md bg-petrol-50 flex items-center justify-center flex-shrink-0">
                <Boxes size={11} className="text-petrol" />
              </span>
              <span className="truncate block max-w-[120px]">{b.name}</span>
            </Link>
          ))}
          {allBrands.length <= 8 && allBrands.length > 0 && <span className="text-sm text-petrol-300">More brands coming soon.</span>}
        </div>
        <Link href="/products" className="flex items-center gap-1.5 mt-4 px-2 text-xs font-semibold text-petrol hover:text-petrol/80 transition-colors">
          View all brands <ArrowRight size={12} />
        </Link>
      </div>
      <div className="relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between">
        <Image src="/images/promo/brands.jpg" alt="" fill sizes="240px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a3830]/90 via-petrol/45 to-petrol/10" />
        <div className="relative z-10 [text-shadow:0_1px_4px_rgba(0,0,0,0.55)]">
          <p className="font-mono text-[10px] uppercase tracking-widest text-petrol-300 mb-2">Trusted names</p>
          <p className="font-display font-bold text-xl text-paper leading-tight mb-2">Genuine branded medicine</p>
          <p className="text-xs text-porcelain/90 leading-relaxed">Every product is sourced directly from licensed distributors — no substitutes.</p>
        </div>
        <Link href="/products" className="relative z-10 mt-5 flex items-center gap-1.5 text-sm font-semibold text-paper hover:text-petrol-300 transition-colors [text-shadow:0_1px_4px_rgba(0,0,0,0.55)]">
          Shop now <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

const megaComponents = {
  categories: CategoriesMega,
  brands: BrandsMega,
};

export function Header() {
  const [promoIdx, setPromoIdx] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [zonePickerOpen, setZonePickerOpen] = useState(false);
  const [zonePickerPos, setZonePickerPos] = useState<{ top: number; left: number } | null>(null);
  const megaTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const zonePickerRef = useRef<HTMLDivElement>(null);
  const zoneTriggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { items, toggleCart } = useCartStore();
  const { ids } = useWishlistStore();
  const cartCount = items.reduce((n, i) => n + i.quantity, 0);
  const wishCount = ids.size;
  const branding = useBranding();
  const liveCategories = useQuery(api.taxonomy.listCategories, {});
  const mobileCategories = liveCategories && liveCategories.length > 0 ? liveCategories : categories;
  const deliveryZones = useQuery(api.delivery.listZones);
  const { zoneId: selectedZoneId, zoneName: selectedZoneName, setZone, clearZone } = useDeliveryZoneStore();
  const [zoneShowcaseIdx, setZoneShowcaseIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPromoIdx((i) => (i + 1) % promos.length), 4200);
    return () => clearInterval(t);
  }, []);

  // A remembered zone can go stale — the admin may delete it, rename the store's
  // zones, or wipe all of them. Once the live list has loaded, drop any selection
  // that no longer exists rather than keep showing a deleted area forever.
  useEffect(() => {
    if (!deliveryZones || !selectedZoneId) return;
    if (!deliveryZones.some((z) => z._id === selectedZoneId)) clearZone();
  }, [deliveryZones, selectedZoneId, clearZone]);

  // Until the customer picks a delivery area, rotate the trigger through the
  // areas we actually deliver to — a quick "look what we cover" showcase.
  useEffect(() => {
    if (selectedZoneName || !deliveryZones || deliveryZones.length < 2) return;
    const t = setInterval(() => setZoneShowcaseIdx((i) => (i + 1) % deliveryZones.length), 3000);
    return () => clearInterval(t);
  }, [selectedZoneName, deliveryZones]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        // Hysteresis: collapse past 80px, but don't re-expand until well back
        // above the top (40px). A single shared threshold flickers the header
        // open/closed when scroll position jitters right around that pixel.
        setScrolled((prev) => (prev ? window.scrollY > 40 : window.scrollY > 80));
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveMega(null);
  }, [pathname]);

  useEffect(() => {
    if (!zonePickerOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (zonePickerRef.current?.contains(target)) return;
      if (zoneTriggerRef.current?.contains(target)) return;
      setZonePickerOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [zonePickerOpen]);

  // The utility bar clips overflow for its scroll-collapse animation, so a
  // dropdown positioned inside it gets cut off — close it if that bar hides.
  useEffect(() => {
    if (scrolled) setZonePickerOpen(false);
  }, [scrolled]);

  const toggleZonePicker = () => {
    if (!zonePickerOpen && zoneTriggerRef.current) {
      const rect = zoneTriggerRef.current.getBoundingClientRect();
      setZonePickerPos({ top: rect.bottom + 8, left: rect.left });
    }
    setZonePickerOpen((v) => !v);
  };

  const openMega = (key: string) => {
    clearTimeout(megaTimerRef.current);
    setActiveMega(key);
  };
  const closeMegaDelayed = () => {
    megaTimerRef.current = setTimeout(() => setActiveMega(null), 180);
  };

  const navItems = [
    { label: 'Categories', key: 'categories' },
    { label: 'Brands', key: 'brands' },
    { label: 'New Arrivals', href: '/new-arrivals' },
    { label: 'Trending', href: '/trending' },
    { label: 'Best Sellers', href: '/best-sellers' },
    { label: 'Offers', href: '/offers', hot: true },
  ];

  return (
    <>
      <header className={cn('sticky top-0 z-40 bg-paper transition-shadow duration-300', scrolled && 'shadow-md')}>
        {/* Row 1 — Utility bar */}
        <AnimatePresence>
          {!scrolled && (
            <motion.div
              initial={{ height: 36, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="bg-[#0e1f1c] overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between">
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-porcelain/60">
                  <MapPin size={11} className="text-petrol-300" />
                  <span className="flex items-center gap-1">
                    Deliver to:{' '}
                    <button
                      ref={zoneTriggerRef}
                      type="button"
                      onClick={toggleZonePicker}
                      className="relative overflow-hidden text-porcelain/90 font-semibold underline-offset-2 hover:underline"
                    >
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={selectedZoneName ?? `showcase-${zoneShowcaseIdx}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.25 }}
                          className="inline-block"
                        >
                          {selectedZoneName ?? deliveryZones?.[zoneShowcaseIdx % (deliveryZones.length || 1)]?.name ?? 'Select area'}
                        </motion.span>
                      </AnimatePresence>
                    </button>
                  </span>
                </div>

                {typeof document !== 'undefined' && createPortal(
                  <AnimatePresence>
                    {zonePickerOpen && zonePickerPos && (
                      <motion.div
                        ref={zonePickerRef}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        style={{ position: 'fixed', top: zonePickerPos.top, left: zonePickerPos.left }}
                        className="w-56 bg-paper border border-line rounded-xl shadow-xl py-1.5 z-50"
                      >
                        {deliveryZones === undefined ? (
                          <p className="px-3.5 py-2 text-xs text-petrol-300">Loading areas…</p>
                        ) : deliveryZones.length === 0 ? (
                          <p className="px-3.5 py-2 text-xs text-petrol-300">No delivery areas set up yet.</p>
                        ) : (
                          deliveryZones.map((z) => (
                            <button
                              key={z._id}
                              type="button"
                              onClick={() => { setZone(z._id, z.name); setZonePickerOpen(false); }}
                              className={cn(
                                'w-full flex items-center justify-between gap-2 text-left px-3.5 py-2 text-sm hover:bg-petrol-50 transition-colors',
                                z._id === selectedZoneId ? 'text-ink font-medium' : 'text-ink/70'
                              )}
                            >
                              <span>{z.name}</span>
                              <span className="font-mono text-xs text-petrol-300">KES {z.price}</span>
                            </button>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>,
                  document.body
                )}
                <div className="flex-1 flex justify-center">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={promoIdx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.28 }}
                      className="text-xs text-porcelain/75 font-medium"
                    >
                      {promos[promoIdx]}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-xs text-porcelain/60">
                  <Link href="/account/orders" className="hover:text-porcelain/90 transition-colors">Track order</Link>
                  <a href={`tel:${branding.phone}`} className="flex items-center gap-1 hover:text-porcelain/90 transition-colors">
                    <Phone size={11} className="text-petrol-300" />{branding.phone}
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Row 2 — Brand + Search + Actions */}
        <div className="border-b border-line/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center gap-4">
            <button className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-petrol-50 transition-colors" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
              <Menu size={21} className="text-ink" />
            </button>

            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              {branding.logo ? (
                <img src={branding.logo} alt={branding.name} className="h-9 sm:h-11 w-auto max-w-[160px] object-contain flex-shrink-0" />
              ) : (
                <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                  <rect x="8" y="18" width="32" height="12" rx="6" fill="#0E4D45" />
                  <rect x="8" y="18" width="16" height="12" rx="6" fill="#5FA89C" />
                  <line x1="24" y1="18" x2="24" y2="30" stroke="white" strokeWidth="1.5" />
                  <circle cx="36" cy="12" r="5" fill="#5FA89C" fillOpacity="0.6" />
                </svg>
              )}
              <BrandName name={branding.name} className="font-display font-bold text-lg sm:text-xl text-ink tracking-tight" />
            </Link>

            <div className="flex-1 max-w-2xl hidden md:block">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full h-11 rounded-full border-2 border-line hover:border-petrol/50 flex items-center gap-3 px-4 text-petrol-300 hover:text-petrol transition-all group"
              >
                <Search size={16} className="text-petrol/60 group-hover:text-petrol flex-shrink-0 transition-colors" />
                <span className="text-sm text-petrol-300/70 group-hover:text-petrol/60 transition-colors">Search medicines, brands, conditions…</span>
              </button>
            </div>

            <div className="flex items-center gap-0.5 ml-auto">
              {/* Search & Cart are covered by the mobile bottom tab bar — desktop only there */}
              <Link href="/account" className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-petrol-50 transition-colors" title="Account">
                <CircleUser size={19} className="text-ink" />
              </Link>
              <Link href="/account/wishlist" className="hidden md:flex relative w-10 h-10 items-center justify-center rounded-xl hover:bg-petrol-50 transition-colors" title="Wishlist">
                <Heart size={19} className="text-ink" />
                {wishCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-signal text-paper font-mono text-[10px] font-bold flex items-center justify-center">{wishCount}</span>}
              </Link>
              <button type="button" onClick={toggleCart} className="hidden md:flex relative w-10 h-10 items-center justify-center rounded-xl hover:bg-petrol-50 transition-colors" title="Cart">
                <ShoppingBag size={19} className="text-ink" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span key={cartCount} initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="absolute top-1 right-1 w-4 h-4 rounded-full bg-signal text-paper font-mono text-[10px] font-bold flex items-center justify-center">
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Row 3 — Nav + Mega */}
        <div className="hidden md:block border-b border-line/40 bg-paper">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center gap-0.5 relative">
            {navItems.map((item) => {
              const isMega = 'key' in item;
              const isActive = 'href' in item && item.href ? pathname.startsWith(item.href) : false;
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => isMega && openMega((item as { key: string }).key)}
                  onMouseLeave={closeMegaDelayed}
                >
                  {!isMega ? (
                    <Link
                      href={(item as { href: string }).href}
                      className={cn(
                        'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                        isActive ? 'text-petrol' : 'text-ink/80 hover:text-petrol hover:bg-petrol-50'
                      )}
                    >
                      {item.label}
                      {(item as { hot?: boolean }).hot && (
                        <span className="ml-1 bg-signal text-paper text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none tracking-wide">HOT</span>
                      )}
                    </Link>
                  ) : (
                    <button
                      className={cn(
                        'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                        activeMega === (item as { key: string }).key ? 'text-petrol bg-petrol-50' : 'text-ink/80 hover:text-petrol hover:bg-petrol-50'
                      )}
                    >
                      {item.label}
                      <ChevronDown size={13} className={cn('transition-transform duration-200', activeMega === (item as { key: string }).key && 'rotate-180')} />
                    </button>
                  )}
                </div>
              );
            })}

            <Link href="/products" className="ml-auto flex items-center gap-1.5 text-xs font-medium text-petrol-300 hover:text-petrol transition-colors">
              All products <ArrowRight size={11} />
            </Link>

            {/* Mega dropdown — anchored to the left edge of the nav row, so it always
                starts under "Categories" regardless of which item triggered it. */}
            <AnimatePresence>
              {activeMega && megaComponents[activeMega as keyof typeof megaComponents] && (() => {
                const MegaComponent = megaComponents[activeMega as keyof typeof megaComponents];
                return (
                  <motion.div
                    key={activeMega}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-0 top-full w-3/4 bg-paper border border-t-0 border-line/60 rounded-b-2xl shadow-2xl z-50"
                    onMouseEnter={() => clearTimeout(megaTimerRef.current)}
                    onMouseLeave={closeMegaDelayed}
                  >
                    <MegaComponent />
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)} />
            <motion.nav
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 w-[288px] bg-paper shadow-2xl overflow-y-auto overscroll-contain md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 h-16 border-b border-line flex-shrink-0">
                <BrandName name={branding.name} className="font-display font-bold text-lg text-ink" />
                <button onClick={() => setMobileMenuOpen(false)} className="w-9 h-9 rounded-xl hover:bg-petrol-50 flex items-center justify-center transition-colors">
                  <X size={18} className="text-ink" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <div className="px-4 py-3">
                  <p className="px-2 mb-1.5 text-[10px] font-mono uppercase tracking-widest text-petrol-300/60">Categories</p>
                  {mobileCategories.map((cat) => {
                    const Icon = catIcons[cat.slug] ?? Pill;
                    return (
                      <Link key={cat.slug} href={`/category/${cat.slug}`} className="flex items-center gap-2.5 px-2 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-petrol-50 hover:text-petrol transition-colors">
                        <span className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', catBg[cat.slug] ?? 'bg-petrol-50 text-petrol')}>
                          <Icon size={13} />
                        </span>
                        {cat.name}
                      </Link>
                    );
                  })}
                </div>
                <div className="px-4 pb-3 border-t border-line/50 pt-3">
                  <p className="px-2 mb-1.5 text-[10px] font-mono uppercase tracking-widest text-petrol-300/60">Shop</p>
                  {[
                    { label: 'New Arrivals', href: '/new-arrivals' },
                    { label: 'Trending', href: '/trending' },
                    { label: 'Best Sellers', href: '/best-sellers' },
                    { label: 'Special Offers', href: '/offers' },
                    { label: 'All Products', href: '/products' },
                  ].map((item) => (
                    <Link key={item.href} href={item.href} className="flex items-center px-2 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-petrol-50 hover:text-petrol transition-colors">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
