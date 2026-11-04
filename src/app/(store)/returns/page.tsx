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
      updated="November 2026"
      sections={[
        {
          heading: 'Overview',
          body: [
            `We want you to be happy with every order from ${branding.name}. This policy explains what you can return, what you cannot, how to ask for a replacement or refund, and how long refunds take.`,
            'Medicines are different from ordinary goods. Once a medicine has left a pharmacy we cannot know how it has been stored or handled, so the rules for medicines are stricter than for other products. This policy does not affect any rights you have under Kenyan consumer protection law.',
          ],
        },
        {
          heading: 'Why medicines cannot be returned',
          body: [
            'For patient safety, and in line with Pharmacy and Poisons Board (PPB) guidance, medicines cannot be returned or exchanged once they have left our pharmacy, even if the pack is unopened. A returned medicine cannot be safely resold, because we cannot guarantee its storage conditions while it was out of our care.',
            'This applies to prescription-only (POM), pharmacy (P) and over-the-counter (OTC) medicines alike. Please check your order carefully before you place it, and ask one of our pharmacists if you are unsure which product is right for you.',
          ],
        },
        {
          heading: 'Wrong, damaged, expired or missing items',
          body: [
            'The rule above does not apply if we made a mistake. You are entitled to a free replacement or a refund if your order arrives with any of the following:',
          ],
          list: [
            'a different product, strength or pack size from the one you ordered',
            'a damaged, leaking or tampered-with pack',
            'a product that is past its expiry date or too close to expiry to be used as directed',
            'items missing from the order',
          ],
          after: [
            'Contact us within 24 hours of delivery with your order number and a clear photo of the item and its packaging. We will arrange a replacement or a refund. You do not need to send anything back unless we ask you to, and if we do, we will collect it and cover the cost.',
          ],
        },
        {
          heading: 'Non-medicine products',
          body: [
            'Some non-medicine products can be returned if they are unused and in their original, sealed packaging.',
          ],
          table: {
            head: ['Item', 'Condition', 'Window'],
            rows: [
              ['Wellness devices, baby care, skincare', 'Original, unopened, unused', '7 days from delivery'],
              ['Opened or used items', 'Not accepted (hygiene and safety)', 'None'],
              ['Medicines (POM, P and OTC)', 'Not returnable', 'None'],
            ],
          },
          after: [
            'Return the item with its original packaging and your order number. We inspect returns when they arrive. If the item meets these conditions we will refund you or exchange it. If it does not, we will tell you why and send it back to you where possible.',
          ],
        },
        {
          heading: 'How to request a replacement, return or refund',
          list: [
            `Message us on WhatsApp at ${branding.whatsapp}, or call ${branding.phone}.`,
            'Give your order number and tell us what is wrong.',
            'Send a clear photo of the item and its packaging (including the batch number and expiry date, if the problem is with a medicine).',
            'We will confirm whether you are entitled to a replacement or refund and what happens next, usually within one business day.',
          ],
          body: ['The quickest way to sort out a problem is to contact us directly.'],
        },
        {
          heading: 'Refund timelines',
          table: {
            head: ['Paid with', 'Typical refund time'],
            rows: [
              ['M-PESA', '1–2 business days'],
              ['Cash on delivery', 'Agreed with you at the time of the refund'],
            ],
          },
          body: [
            'Approved refunds are issued to the original payment method. The times above start from the day we approve the refund, not from the day you contacted us.',
          ],
        },
        {
          heading: 'Cancelling an order',
          body: [
            'You can cancel an order at no cost until it has been dispensed and dispatched. Contact us as soon as possible with your order number. If the order has already been dispensed, medicines cannot be taken back, so we may not be able to cancel it. If you have already paid and your order is cancelled before dispatch, we will refund you in full.',
            'We may cancel an order ourselves if a prescription cannot be verified, if an item is unavailable or if there is a pricing or stock error. If we do, we will tell you and refund anything you have paid.',
          ],
        },
        {
          heading: 'Undeliverable orders',
          body: [
            'If we cannot deliver your order because we cannot reach you or the address is incorrect, the order returns to the pharmacy. Medicines that have left our control cannot be restocked. Please see our Shipping Policy for what happens next.',
          ],
        },
        {
          heading: 'Reporting a problem with a medicine',
          body: [
            'If a medicine causes an unexpected reaction, stop using it and get medical help if you need it. Then tell us the product name, batch number and what happened so that we can follow it up. This is separate from a refund request, and it does not affect your right to one where you are entitled to it. You can also report side effects and quality concerns directly to the Pharmacy and Poisons Board.',
          ],
        },
        {
          heading: 'Contact us',
          body: [
            `Questions about this policy? Message us on WhatsApp at ${branding.whatsapp}, call ${branding.phone}${branding.email ? ` or email ${branding.email}` : ''}.`,
          ],
        },
      ]}
    />
  );
}
