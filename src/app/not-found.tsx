'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';

const helpful = [
  { label: 'All products', href: '/products' },
  { label: 'Offers', href: '/offers' },
  { label: 'Best sellers', href: '/best-sellers' },
  { label: 'Track an order', href: '/account/orders' },
  { label: 'Contact a pharmacist', href: '/contact' },
];

export default function NotFound() {
  const router = useRouter();
  const [q, setQ] = useState('');

  return (
    <div className="min-h-screen bg-porcelain flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-paper border border-line rounded-xl p-6 sm:p-8">
        <Logo size="md" />
        <p className="mt-8 text-sm text-muted-fg tabular-nums">Error 404</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-ink">We could not find that page</h1>
        <p className="mt-2 text-base leading-relaxed text-muted-fg">
          The link may be mistyped or the page may have moved. Search for a medicine, or try one of these.
        </p>

        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            const t = q.trim();
            if (t) router.push(`/search?q=${encodeURIComponent(t)}`);
          }}
          className="mt-6 relative"
        >
          <label htmlFor="nf-search" className="sr-only">Search products</label>
          <Search size={16} aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-fg" />
          <input
            id="nf-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search medicines, brands, conditions"
            className="w-full bg-porcelain border border-line rounded-full pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-muted-fg focus:outline-none focus:border-petrol focus:ring-2 focus:ring-petrol/40"
          />
        </form>

        <ul className="mt-5 flex flex-wrap gap-2">
          {helpful.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="inline-block rounded-full border border-line bg-porcelain px-3.5 py-1.5 text-sm text-ink hover:border-petrol/50 transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-petrol hover:bg-petrol-700 text-white text-sm font-semibold px-5 py-2.5 transition-transform duration-100 active:scale-[0.97]"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
