'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { branding as defaultBranding } from '@/lib/config/branding';
import { cn } from '@/lib/utils';

export function usePharmacyDetails() {
  const settings = useQuery(api.settings.getStoreSettings);
  const get = (key: string) => {
    const v = settings?.find((s) => s.key === key)?.value;
    return typeof v === 'string' && v.trim() ? v.trim() : '';
  };
  return {
    pharmacist: get('pharmacistName'),
    licence: get('ppbLicenceNumber') || defaultBranding.ppbLicenceNumber,
    expiry: get('ppbLicenceExpiry'),
  };
}

/** Renders nothing unless the admin has set the details. */
export function PharmacyDetailsLine({ className }: { className?: string }) {
  const { pharmacist, licence } = usePharmacyDetails();
  if (!pharmacist && !licence) return null;
  return (
    <p className={className}>
      {pharmacist && <>Superintending pharmacist: {pharmacist}</>}
      {pharmacist && licence && ' · '}
      {licence && <>PPB licence no.: {licence}</>}
    </p>
  );
}

/** One-line licence chip for the dark strip at the top of every page. Renders nothing without a number. */
export function LicenceChip({ className }: { className?: string }) {
  const { licence } = usePharmacyDetails();
  if (!licence) return null;
  return (
    <p className={cn('whitespace-nowrap text-xs text-on-deep/70', className)}>
      PPB licence no.{' '}
      <span className="font-semibold tabular-nums tracking-wide text-on-deep">{licence}</span>
    </p>
  );
}

/** Prominent licence card (footer). Shows the superintending pharmacist too when set. */
export function LicenceBlock({ className }: { className?: string }) {
  const { licence, pharmacist, expiry } = usePharmacyDetails();
  if (!licence) return null;
  return (
    <div className={cn('inline-flex flex-col rounded-lg border border-line bg-porcelain px-4 py-3', className)}>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-fg">
        Pharmacy and Poisons Board licence
      </span>
      <span className="mt-0.5 text-lg font-semibold tabular-nums tracking-wide text-ink">{licence}</span>
      {(pharmacist || expiry) && (
        <span className="mt-1 text-xs text-muted-fg">
          {pharmacist && <>Superintending pharmacist: {pharmacist}</>}
          {pharmacist && expiry && ' · '}
          {expiry && <>Valid to {expiry}</>}
        </span>
      )}
    </div>
  );
}
