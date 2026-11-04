'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/LegalPage';
import { faqGroups } from '@/lib/content/faq';
import { FaqAnswer } from '@/components/ui/FaqAnswer';

export default function FAQPage() {
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    const t = query.trim().toLowerCase();
    if (!t) return faqGroups;
    return faqGroups
      .map((g) => ({
        ...g,
        items: g.items.filter((f) => f.q.toLowerCase().includes(t) || f.a.join(' ').toLowerCase().includes(t) || (f.list ?? []).join(' ').toLowerCase().includes(t)),
      }))
      .filter((g) => g.items.length > 0);
  }, [query]);

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="min-h-screen bg-porcelain py-6 sm:py-8">
      <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
        <PageHeader crumb="FAQ" title="Frequently asked questions" />

        <div className="rounded-xl border border-line bg-paper p-4 sm:p-6">
          <label htmlFor="faq-search" className="sr-only">Search questions</label>
          <input
            id="faq-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search, e.g. prescription, refund, M-PESA"
            className="w-full max-w-xl rounded-lg border border-line bg-porcelain px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-fg focus:border-petrol focus:outline-none focus:ring-2 focus:ring-petrol/40"
          />

          {!query && (
            <nav aria-label="Topics" className="mt-4 flex flex-wrap gap-2">
              {faqGroups.map((g) => (
                <a
                  key={g.id}
                  href={`#${g.id}`}
                  className="rounded-full border border-line px-3 py-1.5 text-sm text-ink transition-colors hover:border-petrol hover:text-petrol"
                >
                  {g.title}
                </a>
              ))}
            </nav>
          )}

          <p className="mt-4 text-xs text-muted-fg" aria-live="polite">
            {total} {total === 1 ? 'question' : 'questions'}
          </p>
        </div>

        {groups.length === 0 ? (
          <div className="rounded-xl border border-line bg-paper p-8 text-center">
            <p className="text-base font-semibold text-ink">No questions match &ldquo;{query}&rdquo;</p>
            <p className="mt-1 text-sm text-muted-fg">
              Try another word, or{' '}
              <Link href="/contact" className="text-petrol underline underline-offset-2">ask our team directly</Link>.
            </p>
          </div>
        ) : (
          groups.map((g) => (
            <section key={g.id} id={g.id} className="scroll-mt-28 rounded-xl border border-line bg-paper p-4 sm:p-6">
              <h2 className="text-lg font-semibold tracking-tight text-ink">{g.title}</h2>
              <div className="mt-2 divide-y divide-line">
                {g.items.map((f) => (
                  <details key={f.q} className="group py-3.5" open={Boolean(query)}>
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-sm font-semibold text-ink">
                      <span>{f.q}</span>
                      <span aria-hidden="true" className="mt-0.5 shrink-0 text-muted-fg transition-transform duration-200 group-open:rotate-45">+</span>
                    </summary>
                    <FaqAnswer item={f} />
                  </details>
                ))}
              </div>
            </section>
          ))
        )}

        <p className="px-1 text-sm text-muted-fg">
          Still have a question?{' '}
          <Link href="/contact" className="text-petrol underline underline-offset-2">Contact us</Link>
          {' '}or read our{' '}
          <Link href="/shipping" className="text-petrol underline underline-offset-2">Shipping</Link>,{' '}
          <Link href="/returns" className="text-petrol underline underline-offset-2">Returns</Link>,{' '}
          <Link href="/terms" className="text-petrol underline underline-offset-2">Terms</Link> and{' '}
          <Link href="/privacy" className="text-petrol underline underline-offset-2">Privacy</Link> pages.
        </p>
      </div>
    </div>
  );
}
