'use client';

import { usePharmacyDetails } from '@/components/layout/PharmacyDetails';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { Search, ArrowRight } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { categories as fixtureCategories } from '@/lib/fixtures/categories';
import { useBranding } from '@/hooks/useBranding';
import { useDebounce } from '@/hooks/useDebounce';
import { ProductImagePlaceholder } from '@/components/ui/ProductImagePlaceholder';
import { formatPrice, cn } from '@/lib/utils';

const needs = [
  { label: 'Pain', href: '/category/pain-relief' },
  { label: 'Cold & flu', href: '/category/cough-cold' },
  { label: 'Skin', href: '/category/skin-care' },
  { label: 'Baby', href: '/category/baby-care' },
  { label: 'Digestion', href: '/category/digestive-health' },
  { label: 'Vitamins', href: '/category/vitamins-supplements' },
];

const baseFacts = [
  'Licensed pharmacy',
  'Genuine products',
  'Same-day Nairobi delivery before 2pm',
  'Pay by M-PESA or cash on delivery',
];

const groupLabel = 'px-5 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-fg';

type Dest = { href: string };

function SmartSearch() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounced = useDebounce(q, 250);
  const term = q.trim().toLowerCase();

  const products = useQuery(api.products.searchProducts, term ? { term: debounced, limit: 4 } : 'skip');
  const liveCats = useQuery(api.taxonomy.listCategories, {});
  const conds = useQuery(api.taxonomy.listConditions, {});
  const brandsRes = useQuery(api.brands.list);

  const cats = useMemo(() => {
    const src = liveCats && liveCats.length > 0 ? liveCats : fixtureCategories;
    return term ? src.filter((c) => c.name.toLowerCase().includes(term)).slice(0, 3) : [];
  }, [liveCats, term]);
  const condList = useMemo(
    () => (term && Array.isArray(conds) ? conds.filter((c) => c.name.toLowerCase().includes(term)).slice(0, 3) : []),
    [conds, term],
  );
  const brandList = useMemo(
    () => (term && Array.isArray(brandsRes) ? brandsRes.filter((b) => b.name.toLowerCase().includes(term)).slice(0, 3) : []),
    [brandsRes, term],
  );

  const prodList = term ? (products ?? []) : [];
  const dests: Dest[] = [
    ...prodList.map((p) => ({ href: `/products/${p.slug}` })),
    ...cats.map((c) => ({ href: `/category/${c.slug}` })),
    ...condList.map((c) => ({ href: `/search?q=${encodeURIComponent(c.name)}` })),
    ...brandList.map((b) => ({ href: `/brand/${b.slug}` })),
  ];
  const open = focused && term.length > 0;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset highlighted suggestion when query changes
    setActive(-1);
  }, [q]);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const go = (href: string) => {
    setFocused(false);
    router.push(href);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setFocused(false);
    else if (e.key === 'ArrowDown' && dests.length) {
      e.preventDefault();
      setActive((i) => (i + 1) % dests.length);
    } else if (e.key === 'ArrowUp' && dests.length) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? dests.length - 1 : i - 1));
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    go(active >= 0 && dests[active] ? dests[active].href : `/search?q=${encodeURIComponent(q.trim())}`);
  };

  const row = (i: number) =>
    cn('flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-porcelain', active === i && 'bg-porcelain');

  const cOff = prodList.length;
  const dOff = cOff + cats.length;
  const bOff = dOff + condList.length;

  return (
    <div ref={wrapRef} className="relative">
      <form role="search" onSubmit={submit} className="relative">
        <label htmlFor="hero-search" className="sr-only">What do you need today?</label>
        <Search size={22} aria-hidden="true" className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted-fg" />
        <input
          id="hero-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={onKey}
          placeholder="Medicine, symptom or brand"
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={open}
          aria-controls="hero-suggestions"
          className="h-14 w-full rounded-full border border-line bg-porcelain pl-14 pr-32 text-base text-ink shadow-sm placeholder:text-muted-fg focus:border-petrol focus:bg-paper focus:outline-none focus:ring-2 focus:ring-petrol/40 sm:h-16 sm:text-lg"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-full bg-petrol px-5 text-sm font-medium text-white transition-transform duration-100 hover:bg-petrol-700 active:scale-[0.97] sm:h-12 sm:px-6"
        >
          Search
        </button>
      </form>

      {open && (
        <div id="hero-suggestions" role="listbox" className="absolute inset-x-0 top-full z-30 mt-2 max-h-[60vh] overflow-y-auto overscroll-contain rounded-xl border border-line bg-paper pb-2 shadow-lg">
          {dests.length === 0 && (
            <p className="px-5 py-6 text-sm text-muted-fg">
              {products === undefined ? 'Searching' : `No match for "${q}". Ask a pharmacist on WhatsApp.`}
            </p>
          )}
          {prodList.length > 0 && (
            <>
              <p className={groupLabel}>Products</p>
              {prodList.map((p, i) => (
                <Link key={p._id} href={`/products/${p.slug}`} onMouseEnter={() => setActive(i)} className={row(i)}>
                  <ProductImagePlaceholder className="h-10 w-10 shrink-0 rounded-lg" aspectRatio="" size="sm" name={p.name} categorySlug={p.categorySlug} imageUrl={p.imageUrl} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{p.name}</span>
                    <span className="block truncate text-xs text-muted-fg">{p.brand}</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">{formatPrice(p.price)}</span>
                </Link>
              ))}
            </>
          )}
          {cats.length > 0 && (
            <>
              <p className={groupLabel}>Categories</p>
              {cats.map((c, i) => (
                <Link key={c.slug} href={`/category/${c.slug}`} onMouseEnter={() => setActive(cOff + i)} className={row(cOff + i)}>
                  <span className="flex-1 text-sm text-ink">{c.name}</span>
                  <ArrowRight size={14} className="text-muted-fg" />
                </Link>
              ))}
            </>
          )}
          {condList.length > 0 && (
            <>
              <p className={groupLabel}>Conditions</p>
              {condList.map((c, i) => (
                <Link key={c.slug} href={`/search?q=${encodeURIComponent(c.name)}`} onMouseEnter={() => setActive(dOff + i)} className={row(dOff + i)}>
                  <span className="flex-1 text-sm text-ink">{c.name}</span>
                  <ArrowRight size={14} className="text-muted-fg" />
                </Link>
              ))}
            </>
          )}
          {brandList.length > 0 && (
            <>
              <p className={groupLabel}>Brands</p>
              {brandList.map((b, i) => (
                <Link key={b.slug} href={`/brand/${b.slug}`} onMouseEnter={() => setActive(bOff + i)} className={row(bOff + i)}>
                  <span className="flex-1 text-sm text-ink">{b.name}</span>
                  <ArrowRight size={14} className="text-muted-fg" />
                </Link>
              ))}
            </>
          )}
          <div className="mt-1 border-t border-line px-5 pt-3">
            <Link href={`/search?q=${encodeURIComponent(q.trim())}`} className="inline-flex items-center gap-2 text-sm font-medium text-petrol underline-offset-4 hover:underline">
              See all results <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

const HERO_PHOTOS = [
  { desktop: '/images/hero/hero-vitamins.png', mobile: '/images/hero/hero-vitamins-mobile.png' },
  { desktop: '/images/hero/hero-painrelief.png', mobile: '/images/hero/hero-painrelief-mobile.png' },
  { desktop: '/images/hero/hero-skincare.png', mobile: '/images/hero/hero-skincare-mobile.png' },
  { desktop: '/images/hero/hero-coldflu.png', mobile: '/images/hero/hero-coldflu-mobile.png' },
  { desktop: '/images/hero/hero-babycare.png', mobile: '/images/hero/hero-babycare-mobile.png' },
];

/** Decorative photo background: the original hero photos, crossfading slowly. Pure backdrop, no interaction. */
function HeroBackdrop() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setActive((i) => (i + 1) % HERO_PHOTOS.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-deep">
      {HERO_PHOTOS.map((p, i) => (
        <div
          key={p.desktop}
          className="absolute inset-0 transition-opacity duration-[1200ms] ease-out motion-reduce:transition-none"
          style={{ opacity: i === active ? 1 : 0 }}
        >
          <Image src={p.desktop} alt="" fill priority={i === 0} sizes="(min-width: 1280px) 1280px, 100vw" className="hidden object-cover lg:block" />
          <Image src={p.mobile} alt="" fill priority={i === 0} sizes="100vw" className="object-cover lg:hidden" />
        </div>
      ))}
      {/* Keeps the photo calm behind the cards. */}
      <div className="absolute inset-0 bg-gradient-to-b from-deep/40 via-deep/20 to-deep/50" />
    </div>
  );
}

export function Hero() {
  const branding = useBranding();
  const { licence } = usePharmacyDetails();
  const facts = [licence ? `PPB licensed pharmacy · No. ${licence}` : baseFacts[0], ...baseFacts.slice(1)];
  const wa = String(branding.whatsapp).replace(/[^0-9]/g, '');
  const waHref = `https://wa.me/${wa}?text=${encodeURIComponent('Hello, I have a prescription to send.')}`;

  // Leaving the hero starts with the very first scroll: the content lifts and fades and the
  // photo darkens, so it is clear you are moving past it.
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const contentY = useTransform(scrollY, [0, 260], [0, -56]);
  const contentOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scrim = useTransform(scrollY, [0, 360], [0, 0.65]);

  return (
    <section aria-label="Find what you need" className="relative isolate overflow-hidden">
      <HeroBackdrop />
      {!reduceMotion && <motion.div aria-hidden="true" className="absolute inset-0 -z-10 bg-deep" style={{ opacity: scrim }} />}
      <motion.div
        style={reduceMotion ? undefined : { y: contentY, opacity: contentOpacity }}
        className="mx-auto flex min-h-[calc(100svh-11rem)] max-w-7xl flex-col justify-center gap-4 px-4 py-10 sm:px-6 lg:px-8"
      >
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="rounded-xl border border-line bg-paper p-6 sm:p-10 lg:col-span-8 lg:p-12">
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-tighter text-ink sm:text-5xl lg:text-6xl">
            What do you
            <br />
            need <span className="text-petrol">today?</span>
          </h1>
          <div className="mt-8">
            <SmartSearch />
          </div>
          <ul className="mt-5 flex flex-wrap gap-2">
            {needs.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className="inline-block rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-[colors,transform] duration-100 hover:border-petrol hover:text-petrol active:scale-[0.97]"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col rounded-xl border border-line bg-paper p-4 sm:p-6 lg:col-span-4">
          <div className="flex flex-1 flex-col justify-between gap-6 rounded-lg border border-dashed border-line bg-porcelain p-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-ink">Have a prescription?</h2>
              <p className="mt-2 text-base leading-relaxed text-muted-fg">
                Upload a photo. A pharmacist checks it before dispatch.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="/prescription"
                className="flex h-12 items-center justify-center rounded-full bg-petrol text-sm font-medium text-white transition-transform duration-100 hover:bg-petrol-700 active:scale-[0.97]"
              >
                Upload prescription
              </Link>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 text-center text-sm font-medium text-ink underline-offset-4 hover:text-petrol hover:underline"
              >
                Or send on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <ul className="grid grid-cols-2 divide-line rounded-xl border border-line bg-paper text-sm text-ink lg:grid-cols-4 lg:divide-x">
        {facts.map((f, i) => (
          <li key={f} className={cn('px-5 py-4', i > 1 && 'border-t border-line lg:border-t-0', i % 2 === 1 && 'border-l border-line lg:border-l-0')}>
            {f}
          </li>
        ))}
      </ul>
      </motion.div>
    </section>
  );
}
