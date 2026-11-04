'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export function usePharmacyDetails() {
  const settings = useQuery(api.settings.getStoreSettings);
  const get = (key: string) => {
    const v = settings?.find((s) => s.key === key)?.value;
    return typeof v === 'string' && v.trim() ? v.trim() : '';
  };
  return {
    pharmacist: get('pharmacistName'),
    licence: get('ppbLicenceNumber'),
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
