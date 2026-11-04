'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/LegalPage';
import { useBranding } from '@/hooks/useBranding';
import { usePharmacyDetails } from '@/components/layout/PharmacyDetails';

const commitments = [
  { title: '100% genuine', sub: 'Every product is verified by our pharmacists.' },
  { title: 'PPB licensed', sub: 'Fully licensed and regulated by the Pharmacy and Poisons Board.' },
  { title: 'Expert team', sub: 'Qualified pharmacists on every shift.' },
  { title: 'Same-day delivery', sub: 'In Nairobi and major towns.' },
];

export default function AboutPage() {
  const branding = useBranding();
  const { pharmacist, licence, expiry } = usePharmacyDetails();
  return (
    <div className="min-h-screen bg-porcelain py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <PageHeader
          crumb="About us"
          title={`About ${branding.name}`}
        />

        <section className="bg-paper border border-line rounded-xl p-4 sm:p-6">
          <div className="max-w-3xl space-y-3">
            <p className="text-sm leading-relaxed text-ink/80">
              {branding.name} was built on one conviction: every Kenyan family deserves access to genuine, affordable medication — without the guesswork.
            </p>
            <p className="text-sm leading-relaxed text-ink/80">
              We work directly with licensed manufacturers and distributors to bring genuine medicines to your door, with registered pharmacists available to answer your questions.
            </p>
          </div>
        </section>

        <section className="bg-paper border border-line rounded-xl p-4 sm:p-6">
          <dl className="grid sm:grid-cols-2 sm:gap-x-8">
            {commitments.map((c) => (
              <div key={c.title} className="py-3 border-t border-line first:border-t-0 sm:[&:nth-child(2)]:border-t-0">
                <dt className="text-sm font-semibold text-ink">{c.title}</dt>
                <dd className="text-sm text-muted-fg">{c.sub}</dd>
              </div>
            ))}
          </dl>
        </section>

        {(pharmacist || licence) && (
          <section className="bg-paper border border-line rounded-xl p-4 sm:p-6">
            <h2 className="text-base font-semibold tracking-tight text-ink">Pharmacy details</h2>
            <dl className="mt-3 space-y-1 text-sm">
              {pharmacist && (
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-muted-fg">Superintending pharmacist:</dt>
                  <dd className="text-ink">{pharmacist}</dd>
                </div>
              )}
              {licence && (
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-muted-fg">PPB licence no.:</dt>
                  <dd className="text-ink">{licence}</dd>
                </div>
              )}
              {licence && expiry && (
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-muted-fg">Valid until:</dt>
                  <dd className="text-ink">{expiry}</dd>
                </div>
              )}
            </dl>
          </section>
        )}
      </div>
    </div>
  );
}
