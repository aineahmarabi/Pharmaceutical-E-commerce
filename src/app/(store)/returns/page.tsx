'use client';

import React from 'react';
import { LegalPage } from '@/components/layout/LegalPage';
import { useBranding } from '@/hooks/useBranding';

export default function ReturnsPolicyPage() {
  const branding = useBranding();
  return (
    <LegalPage
      eyebrow="Help"
      title="Returns & Refunds"
      updated="August 2026"
      sections={[
        {
          heading: 'Medicines cannot be returned',
          body: [
            'For patient safety, and in line with Pharmacy and Poisons Board (PPB) guidance, medicines cannot be returned or exchanged once they have left our pharmacy — even if unopened. This protects everyone from receiving previously dispensed or improperly stored medication.',
          ],
        },
        {
          heading: 'Wrong, damaged, or missing items',
          body: [
            'If you receive the wrong product, a damaged item, or your order arrives incomplete, contact us within 24 hours of delivery. We will arrange a free replacement or refund — no need to send anything back unless we ask you to.',
          ],
        },
        {
          heading: 'Non-medicine products',
          body: [
            'Wellness devices, baby care, and skincare items in original, unopened condition can be returned within 7 days of delivery for a refund or exchange. Opened or used items cannot be accepted for hygiene reasons.',
          ],
        },
        {
          heading: 'Refund timelines',
          body: [
            'Approved refunds are issued to the original payment method. M-PESA refunds typically reflect within 1–2 business days; card refunds can take 5–10 business days depending on your bank.',
          ],
        },
        {
          heading: 'How to request a return or refund',
          body: [
            `Message us on WhatsApp at ${branding.whatsapp} with your order number and a photo of the item, and our team will guide you through the next steps.`,
          ],
        },
      ]}
    />
  );
}
