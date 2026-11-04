'use client';

import React from 'react';
import { LegalPage } from '@/components/layout/LegalPage';
import { useBranding } from '@/hooks/useBranding';

export default function PrivacyPolicyPage() {
  const branding = useBranding();
  const contact = branding.email || 'our support team';
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      updated="November 2026"
      sections={[
        {
          heading: 'About this policy',
          body: [
            `${branding.name} ("we", "us") is an online pharmacy in Kenya. This policy explains what personal data we collect when you use this website or order from us, why we collect it, who we share it with, how long we keep it and what rights you have. We handle personal data in line with Kenya’s Data Protection Act, 2019, and we are the data controller for the information described here.`,
            'Some of the data we handle, such as prescriptions, concerns your health. The law treats this as sensitive personal data, and we take extra care with it.',
          ],
        },
        {
          heading: 'What we collect',
          body: ['The data we collect depends on how you use the site.'],
          list: [
            'Order details: your name, phone number, email address, delivery address and the items you order.',
            'Account details, if you create an account: your name, contact details, a securely hashed password, saved addresses, wishlist and order history.',
            'Health information: prescriptions you share with us, and any details you give a pharmacist about the patient, such as allergies, other medicines or conditions.',
            'Payment information: confirmation that a payment was made and its reference. M-PESA PINs are never seen or stored by us.',
            'Communications: messages you send us by WhatsApp, phone, email or the contact form, and your newsletter sign-up.',
            'Technical data: your device and browser type and how you use the site, and information stored in your browser so the site works (see Cookies and browser storage).',
          ],
        },
        {
          heading: 'How we collect it',
          body: [
            'Mostly directly from you, when you place an order, create an account, upload or send a prescription, contact us or sign up for updates. Some technical data is collected automatically when you use the site. If you order for someone else, we collect their details from you, and you confirm you are entitled to share them.',
          ],
        },
        {
          heading: 'Why we use your data',
          table: {
            head: ['Purpose', 'Basis'],
            rows: [
              ['Process, dispense, deliver and support your order', 'Contract'],
              ['Verify prescriptions and supply medicines safely', 'Legal obligation and your consent'],
              ['Keep the records pharmacy law requires', 'Legal obligation'],
              ['Send order updates by SMS, WhatsApp, email or phone', 'Contract and legitimate interests'],
              ['Prevent fraud, misuse and abuse of prescriptions', 'Legitimate interests and legal obligation'],
              ['Send offers and news you have asked for', 'Consent'],
              ['Keep the site secure and improve it', 'Legitimate interests'],
            ],
          },
          body: [
            'We only use your data for the purposes above, or for a closely related purpose, or where the law requires or allows it. We do not sell your personal data.',
          ],
        },
        {
          heading: 'Prescriptions and health information',
          body: [
            'Prescriptions and health details are used only to verify and fulfil your order and to meet our legal duties as a pharmacy. They are stored securely and only licensed pharmacists and the staff who need them to complete your order can access them. We may contact your prescriber to confirm a prescription.',
            'You can choose not to share health information, but we may then be unable to supply a prescription-only medicine.',
          ],
        },
        {
          heading: 'Who we share data with',
          body: ['We share personal data only where it is needed, and only with:'],
          list: [
            'delivery riders and courier partners, who receive the name, phone number and address needed to deliver your order',
            'payment partners, to process M-PESA payments',
            'technology and service providers that host the website, store data, send messages or provide chat, under agreements that require them to protect it',
            'prescribers and other healthcare professionals, where needed to verify a prescription or protect a patient',
            'regulators, courts, law enforcement and other authorities, including the Pharmacy and Poisons Board, where the law requires or allows it',
            'a buyer or successor of our business, if it is ever sold or reorganised, who must continue to protect your data',
          ],
          after: ['We never sell your personal data or share it with advertisers.'],
        },
        {
          heading: 'Cookies and browser storage',
          body: [
            'The site stores small amounts of information in your browser so that it works as you expect, for example your cart, wishlist, saved delivery area and light or dark mode choice. This is needed to provide the service you asked for. You can clear it in your browser settings, but parts of the site, such as your cart, may then stop working properly.',
            'If we introduce analytics or other optional tools, we will update this policy and, where the law requires it, ask for your consent first.',
          ],
        },
        {
          heading: 'Marketing and your choices',
          body: [
            'We send offers and news only if you have signed up for them. Every message tells you how to stop, or you can contact us at any time. Order and delivery messages are not marketing and will continue while you have an open order.',
          ],
        },
        {
          heading: 'How long we keep data',
          body: [
            'We keep personal data only for as long as we need it for the purposes above, and for as long as the law requires. Pharmacy and tax rules oblige us to keep certain records, such as prescription and order records, for set periods. When data is no longer needed, we delete or anonymise it.',
            'If you delete your account, we remove your profile, saved addresses and wishlist, but we may keep order and prescription records we are legally required to retain.',
          ],
        },
        {
          heading: 'Keeping your data secure',
          body: [
            'We use measures appropriate to the sensitivity of the data. These include encrypted connections, hashed passwords, access limited to people who need it and secure storage of prescriptions. No system is completely secure, so please protect your password and tell us at once if you suspect misuse of your account.',
            'If a breach is likely to put your rights at risk, we will notify you and the Office of the Data Protection Commissioner as the law requires.',
          ],
        },
        {
          heading: 'Transfers outside Kenya',
          body: [
            'Some of our service providers may process data outside Kenya. Where that happens, we take steps to make sure your data stays protected as the Data Protection Act requires, for example through contracts with the provider and appropriate safeguards.',
          ],
        },
        {
          heading: 'Your rights',
          body: ['Under the Data Protection Act, 2019, you have the right to:'],
          list: [
            'be told how your data is used, which is the purpose of this policy',
            'access the personal data we hold about you',
            'ask us to correct data that is wrong or incomplete',
            'ask us to delete data we no longer need or have no right to keep',
            'object to, or ask us to restrict, how we use your data, including for marketing',
            'receive your data in a commonly used format, where that applies',
            'withdraw your consent at any time, without affecting what we did before you withdrew it',
          ],
          after: [
            'Some rights have exceptions. For example, we cannot delete records that the law requires pharmacies to keep. We may need to confirm your identity before acting on a request, and we will reply within the time the law allows.',
          ],
        },
        {
          heading: 'Children',
          body: [
            'This website is for adults. We do not knowingly collect data from children. If you order medicine for a child, you are responsible for their information, and we will use it only to supply the order safely.',
          ],
        },
        {
          heading: 'Complaints',
          body: [
            'If you are unhappy with how we have handled your data, please contact us first and we will try to put it right. You also have the right to complain to the Office of the Data Protection Commissioner of Kenya.',
          ],
        },
        {
          heading: 'Changes to this policy',
          body: [
            'We may update this policy from time to time. The date at the top shows when it was last changed. If we make a significant change, we will tell you on the site or by other suitable means.',
          ],
        },
        {
          heading: 'Contact us',
          body: [
            `For privacy questions or to use any of your rights, contact us at ${contact}, on WhatsApp at ${branding.whatsapp} or by phone on ${branding.phone}. You can also write to us at ${branding.address}.`,
          ],
        },
      ]}
    />
  );
}
