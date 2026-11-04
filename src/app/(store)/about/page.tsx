'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/LegalPage';
import { useBranding } from '@/hooks/useBranding';
import { usePharmacyDetails, LicenceBlock } from '@/components/layout/PharmacyDetails';

const commitments = [
  { title: '100% genuine', sub: 'Every product is verified by our pharmacists.' },
  { title: 'Expert team', sub: 'Qualified pharmacists on every shift.' },
  { title: 'Same-day delivery', sub: 'In Nairobi and major towns.' },
];

export default function AboutPage() {
  const branding = useBranding();
  const { licence } = usePharmacyDetails();
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

        {licence && (
          <section className="bg-paper border border-line rounded-xl p-4 sm:p-6" aria-labelledby="licence-heading">
            <div className="grid gap-5 md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:gap-8">
              <LicenceBlock />
              <div className="max-w-2xl space-y-2 text-sm leading-relaxed text-ink/80">
                <h2 id="licence-heading" className="text-base font-semibold tracking-tight text-ink">Licensed to dispense</h2>
                <p>
                  {branding.name} is licensed by the Pharmacy and Poisons Board (PPB), the regulator of pharmacies and medicines in Kenya, under licence no.{' '}
                  <span className="font-semibold tabular-nums text-ink">{licence}</span>. Medicines are supplied under the supervision of a registered pharmacist, and prescription-only medicines are dispensed only against a valid prescription.
                </p>
                <p>You can ask the PPB to confirm any pharmacy&apos;s licence. If you have a concern about a product or our service, contact us or the Board.</p>
              </div>
            </div>
          </section>
        )}

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
      </div>
    </div>
  );
}
