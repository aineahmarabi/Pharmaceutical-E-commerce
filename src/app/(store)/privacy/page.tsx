'use client';

import React from 'react';
import { LegalPage } from '@/components/layout/LegalPage';
import { useBranding } from '@/hooks/useBranding';

export default function PrivacyPolicyPage() {
  const branding = useBranding();
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      updated="August 2026"
      sections={[
        {
          heading: 'What we collect',
          body: [
            'When you check out as a guest, we collect your name, phone number, email, and delivery address to fulfil your order. If you create an account, we also store a securely hashed password and any profile details, saved addresses, and order history you choose to add.',
            'Prescription uploads for POM medicines are stored securely and only accessed by our licensed pharmacists for verification.',
          ],
        },
        {
          heading: 'How we use your information',
          body: [
            'We use your data to process and deliver orders, verify prescriptions, provide customer support, and send order updates by SMS, email, or WhatsApp. We do not sell your personal data to third parties.',
          ],
        },
        {
          heading: 'Your account is optional',
          body: [
            'You never need an account to shop with us — guest checkout is fully supported. If you sign up, you can request account deletion at any time and we will remove your stored profile and address data, subject to order records we are legally required to keep.',
          ],
        },
        {
          heading: 'Payment data',
          body: [
            'Card and M-PESA payments are processed by our payment partners over encrypted connections. We do not store full card numbers on our servers.',
          ],
        },
        {
          heading: 'Data protection compliance',
          body: [
            `We handle personal data in line with Kenya's Data Protection Act, 2019. You have the right to access, correct, or request deletion of your personal data at any time.`,
          ],
        },
        {
          heading: 'Contact us',
          body: [
            `For any privacy questions or data requests, reach us at ${branding.email || 'our support team'} or via WhatsApp at ${branding.whatsapp}.`,
          ],
        },
      ]}
    />
  );
}
