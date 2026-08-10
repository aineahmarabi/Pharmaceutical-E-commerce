'use client';

import React from 'react';
import { LegalPage } from '@/components/layout/LegalPage';
import { useBranding } from '@/hooks/useBranding';

export default function TermsPage() {
  const branding = useBranding();
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      updated="August 2026"
      sections={[
        {
          heading: 'Who we are',
          body: [
            `${branding.name} is an online pharmacy operating in Kenya, licensed and regulated by the Pharmacy and Poisons Board (PPB). By placing an order or creating an account, you agree to these terms.`,
          ],
        },
        {
          heading: 'Accounts',
          body: [
            'Creating an account is optional — you can browse and check out as a guest. If you do create one, you are responsible for keeping your login details secure and for all activity under your account.',
          ],
        },
        {
          heading: 'Orders and prescriptions',
          body: [
            'By ordering a prescription-only (POM) medicine, you confirm that any prescription you upload is genuine, current, and issued to you or the person you are ordering for. We reserve the right to refuse or cancel any order that fails pharmacist verification.',
          ],
        },
        {
          heading: 'Pricing and availability',
          body: [
            'Prices are shown in Kenyan Shillings (KES) and may change without notice. If an item becomes unavailable after you order it, we will contact you to offer a substitute, partial refund, or full refund.',
          ],
        },
        {
          heading: 'Payments',
          body: [
            'We accept M-PESA, major debit/credit cards, and cash on delivery. Payment is processed securely; we do not store your full card details on our servers.',
          ],
        },
        {
          heading: 'Limitation of liability',
          body: [
            `${branding.name} is not liable for indirect or consequential loss arising from delivery delays outside our reasonable control. Nothing in these terms limits liability that cannot be excluded under Kenyan law.`,
          ],
        },
        {
          heading: 'Changes to these terms',
          body: [
            'We may update these terms from time to time. Continued use of the site after changes are posted means you accept the revised terms.',
          ],
        },
        {
          heading: 'Contact',
          body: [
            `Questions about these terms can be sent to ${branding.email || 'our support team'} or via WhatsApp at ${branding.whatsapp}.`,
          ],
        },
      ]}
    />
  );
}
