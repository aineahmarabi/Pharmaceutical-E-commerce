'use client';

import { usePharmacyDetails } from '@/components/layout/PharmacyDetails';
import React from 'react';
import { LegalPage } from '@/components/layout/LegalPage';
import { useBranding } from '@/hooks/useBranding';

export default function ShippingPolicyPage() {
  const branding = useBranding();
  const { licence } = usePharmacyDetails();
  return (
    <LegalPage
      eyebrow="Help"
      title="Shipping Policy"
      updated="November 2026"
      sections={[
        {
          heading: 'Overview',
          body: [
            `This policy explains how ${branding.name} delivers your order, how long it takes, what it costs and what happens if something goes wrong. It applies to every order placed on this website, whether you check out as a guest or with an account.`,
            'Medicines are health products. Because of that, some orders need a pharmacist’s check before they leave the pharmacy, and some products must be handled with care. Those steps are explained below.',
            ...(licence ? [`We deliver from our licensed pharmacy in ${branding.address} (Pharmacy and Poisons Board licence no. ${licence}), so everything you receive is supplied under the supervision of a registered pharmacist.`] : []),
          ],
        },
        {
          heading: 'Where we deliver',
          body: [
            `We deliver across Kenya from our pharmacy in ${branding.address}. Nairobi and surrounding areas are covered by our own riders. Other towns are served through vetted courier partners.`,
            'We do not currently deliver outside Kenya, and we cannot ship to a PO Box. Please give a physical address or a clear landmark and a phone number that will be answered on the day.',
          ],
        },
        {
          heading: 'How an order reaches you',
          list: [
            'You place your order and receive an order number straight away.',
            'If your order contains a prescription-only (POM) medicine, a pharmacist reviews your prescription first. Orders with only over-the-counter or pharmacy items go straight to packing.',
            'Your items are picked, checked against the order and packed in plain, sealed packaging.',
            'A rider or courier collects the parcel and calls you on the number given at checkout.',
            'You receive the order, check it, and pay if you chose cash on delivery.',
          ],
          body: ['Every order follows the same path:'],
        },
        {
          heading: 'Delivery times',
          table: {
            head: ['Where', 'Order placed', 'Typical arrival'],
            rows: [
              ['Nairobi', 'Before 2pm, business day', 'Same day'],
              ['Nairobi', 'After 2pm, or on a non-business day', '1–3 business days'],
              ['Other towns', 'Any time', '1–3 business days'],
            ],
          },
          body: [
            'Times are estimates, counted from the moment your order is confirmed. They start once any prescription has been verified, so a prescription that is unclear or incomplete will delay your order until we have what we need.',
            'Business days are Monday to Friday, excluding public holidays. Delivery can take longer during public holidays, severe weather, road closures or exceptional demand. If your order is delayed we will tell you by SMS, WhatsApp or phone.',
          ],
        },
        {
          heading: 'Delivery fees',
          body: [
            'Delivery fees depend on your delivery zone. The exact fee is shown at checkout before you pay, so there are no surprises.',
            'If you add or remove items after choosing a delivery option, the fee is recalculated automatically. We do not add hidden handling charges.',
          ],
        },
        {
          heading: 'Store pickup',
          body: [
            'You can choose store pickup at checkout instead of delivery. Pickup orders have no delivery fee. We will let you know when your order is ready for collection.',
            'Please bring your order number and a valid ID. If your order contains a POM medicine, bring the original prescription as well. For safety, we may ask the person collecting to confirm the patient’s name, and we may decline to hand over medicines if we are not satisfied that it is appropriate to do so.',
          ],
        },
        {
          heading: 'Prescription medicines',
          body: [
            'Orders that contain prescription-only medicines are held until a pharmacist has checked the prescription. This protects you and is required of every licensed pharmacy in Kenya.',
            'If anything is missing, unclear or out of date, we will contact you rather than dispatch the medicine. We may also contact your prescriber to confirm a prescription. Medicines that cannot be supplied without a valid prescription will not be delivered until we have one.',
          ],
        },
        {
          heading: 'Age-restricted products',
          body: [
            'A small number of products are for adults only. We may ask the person receiving the order to confirm their age and, where appropriate, to show ID. If the recipient cannot do this, the rider will not hand the parcel over.',
          ],
        },
        {
          heading: 'Tracking and notifications',
          body: [
            'You receive an order number as soon as your order is placed. Signed-in customers can follow every order under Account, then Orders. Guests can use Track order with their order number and the phone number or email used at checkout.',
            'We send updates by SMS, WhatsApp, email or phone call, depending on the contact details you gave us, when your order is confirmed, dispatched and delivered, or if there is a delay.',
          ],
        },
        {
          heading: 'Delivery attempts',
          body: [
            'The rider or courier will call the number on your order before arriving. Please keep your phone on and reachable.',
          ],
          list: [
            'If nobody is available to receive the parcel, we will try to arrange another delivery time with you.',
            'Medicines and health products should not be left unattended, so we will not leave a parcel at a gate, with a neighbour or in an unattended location unless you have agreed to it with us beforehand.',
            'If we cannot reach you after reasonable attempts, the order is returned to the pharmacy. We will contact you to rearrange delivery. A further delivery fee may apply, and medicines that have left our control cannot be restocked.',
          ],
        },
        {
          heading: 'Storage-sensitive products',
          body: [
            'Some products must be kept away from heat, light or moisture, or need to be refrigerated. We pack them accordingly and tell you how to store them when they arrive. Please unpack and store them as directed as soon as you receive them.',
          ],
        },
        {
          heading: 'Checking your order on arrival',
          body: [
            'Please check your parcel when it arrives. Make sure the packaging is sealed and undamaged, the items match your order and nothing has expired.',
            'If anything is wrong, tell the rider and contact us within 24 hours of delivery with your order number and a photo. We will replace or refund wrong, damaged or missing items. Our Returns & Refunds page has the full details.',
          ],
        },
        {
          heading: 'Delays and things outside our control',
          body: [
            `We take reasonable care to deliver on time, but we are not responsible for delays caused by events outside our reasonable control, such as severe weather, strikes, road closures, network outages, public emergencies, courier delays or incorrect address details. If a delay is significant, we will tell you and, where you prefer, cancel the order and refund you in full.`,
          ],
        },
        {
          heading: 'Contact us',
          body: [
            `For help with a delivery, message us on WhatsApp at ${branding.whatsapp} or call ${branding.phone}. Please have your order number ready.`,
          ],
        },
      ]}
    />
  );
}
