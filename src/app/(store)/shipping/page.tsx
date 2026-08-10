'use client';

import React from 'react';
import { LegalPage } from '@/components/layout/LegalPage';
import { branding } from '@/lib/config/branding';

export default function ShippingPolicyPage() {
  return (
    <LegalPage
      eyebrow="Help"
      title="Shipping Policy"
      updated="August 2026"
      sections={[
        {
          heading: 'Delivery areas',
          body: [
            `We deliver across Kenya from our fulfilment base in ${branding.address}. Nairobi and surrounding areas are covered by our own riders; other towns are served through vetted courier partners.`,
          ],
        },
        {
          heading: 'Delivery times',
          body: [
            'Orders placed before 2pm on a business day are delivered same-day within Nairobi. Orders placed after 2pm, or in other towns, typically arrive within 1–3 business days.',
            'Delivery windows can shift during public holidays or severe weather — we will notify you by SMS or WhatsApp if your order is delayed.',
          ],
        },
        {
          heading: 'Delivery fees',
          body: [
            `Delivery fees are calculated at checkout based on your zone. Orders over KES ${branding.deliveryThreshold.toLocaleString()} qualify for free delivery.`,
          ],
        },
        {
          heading: 'Tracking your order',
          body: [
            'Every order gets an order number by SMS and email as soon as it is placed. You can check its status any time from Account → My orders, or by tracking it as a guest with your order number and phone/email at Account → Track order.',
          ],
        },
        {
          heading: 'Prescription verification',
          body: [
            'Orders containing prescription-only (POM) medicines are held for pharmacist review before dispatch. This can add a short delay while we verify your prescription — we will contact you if anything is missing.',
          ],
        },
        {
          heading: 'Questions',
          body: [
            `Reach our support team any time via WhatsApp at ${branding.whatsapp}, or by phone at ${branding.phone}.`,
          ],
        },
      ]}
    />
  );
}
