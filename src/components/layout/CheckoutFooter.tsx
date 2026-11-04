'use client';

import { usePharmacyDetails } from '@/components/layout/PharmacyDetails';
import React from 'react';
import Link from 'next/link';
import { useBranding } from '@/hooks/useBranding';

const links = [
  { label: 'Shipping', href: '/shipping' },
  { label: 'Returns', href: '/returns' },
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Contact', href: '/contact' },
];

/** Quiet footer for the checkout: policies only, nothing that pulls the shopper away. */
export function CheckoutFooter() {
  const branding = useBranding();
  const { licence } = usePharmacyDetails();
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 pb-24 pt-5 text-xs text-muted-fg sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 lg:pb-5">
        <p>&copy; {new Date().getFullYear()} {branding.name}. PPB licence no. <span className="font-semibold tabular-nums text-ink">{licence}</span></p>
        <ul className="flex flex-wrap gap-x-5 gap-y-1">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="hover:text-ink hover:underline underline-offset-4">{l.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
