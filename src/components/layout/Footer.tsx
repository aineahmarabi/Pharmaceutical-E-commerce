'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useBranding } from '@/hooks/useBranding';
import { categories as fixtureCategories } from '@/lib/fixtures/categories';
import { Logo } from '@/components/layout/Logo';
import { LicenceBlock } from '@/components/layout/PharmacyDetails';
import { NewsletterSignup } from '@/components/sections/NewsletterSignup';

const linkClass = 'text-sm text-muted-fg transition-colors hover:text-ink hover:underline underline-offset-4';
const headingClass = 'mb-4 text-xs font-semibold uppercase tracking-wider text-ink';

const help = [
  { label: 'Track order', href: '/account/orders' },
  { label: 'Prescription', href: '/prescription' },
  { label: 'Delivery', href: '/shipping' },
  { label: 'Returns', href: '/returns' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];
const legal = [
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Shipping', href: '/shipping' },
  { label: 'Returns', href: '/returns' },
];

export function Footer() {
  const branding = useBranding();
  const liveCategories = useQuery(api.taxonomy.listCategories, {});
  const categories = liveCategories && liveCategories.length > 0 ? liveCategories : fixtureCategories;

  const socialLinks = [
    { href: branding.socialLinks?.twitter, label: 'X' },
    { href: branding.socialLinks?.instagram, label: 'Instagram' },
    { href: branding.socialLinks?.facebook, label: 'Facebook' },
  ].filter((s): s is typeof s & { href: string } => Boolean(s.href));

  const waNumber = String(branding.whatsapp).replace(/[^0-9]/g, '');

  return (
    <footer className="mt-16 border-t border-line bg-paper text-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-md">
            <Logo size="lg" />
            <p className="mt-3 text-sm leading-relaxed text-muted-fg">
              A licensed pharmacy delivering genuine medicines and health products.
            </p>
            <LicenceBlock className="mt-4" />
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center rounded-full bg-petrol px-5 text-sm font-medium text-white transition-transform duration-100 hover:bg-petrol-700 active:scale-[0.97]"
            >
              Ask a pharmacist
            </a>
            <a href={`tel:${branding.phone}`} className="text-sm font-medium tabular-nums text-ink hover:underline underline-offset-4">
              {branding.phone}
            </a>
            {branding.email ? (
              <a href={`mailto:${branding.email}`} className="text-sm text-muted-fg hover:text-ink hover:underline underline-offset-4">
                {branding.email}
              </a>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line py-10 md:grid-cols-4 lg:grid-cols-5">
          <nav aria-label="Shop">
            <h3 className={headingClass}>Shop</h3>
            <ul className="space-y-2.5">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/category/${cat.slug}`} className={linkClass}>{cat.name}</Link>
                </li>
              ))}
              <li>
                <Link href="/products" className={linkClass}>All products</Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Help">
            <h3 className={headingClass}>Help</h3>
            <ul className="space-y-2.5">
              {help.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company">
            <h3 className={headingClass}>Company</h3>
            <ul className="space-y-2.5">
              <li><Link href="/about" className={linkClass}>About us</Link></li>
              <li><Link href="/offers" className={linkClass}>Offers</Link></li>
              <li><Link href="/terms" className={linkClass}>Terms</Link></li>
              <li><Link href="/privacy" className={linkClass}>Privacy</Link></li>
              {socialLinks.map(({ href, label }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 lg:col-span-2 lg:justify-self-end">
            <NewsletterSignup />
          </div>
        </div>

        <div className="space-y-3 border-t border-line pb-16 pt-6 text-xs text-muted-fg md:pb-6">
          <p>
            Licensed pharmacy. Prescription-only medicines are dispensed against a valid prescription checked by a pharmacist.
          </p>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>Pay by M-PESA or cash on delivery.</p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {legal.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-ink hover:underline underline-offset-4">{item.label}</Link>
                </li>
              ))}
            </ul>
            <p>&copy; {new Date().getFullYear()} {branding.name}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
