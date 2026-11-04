'use client';

import { usePharmacyDetails } from '@/components/layout/PharmacyDetails';
import React from 'react';
import { LegalPage } from '@/components/layout/LegalPage';
import { useBranding } from '@/hooks/useBranding';

export default function TermsPage() {
  const branding = useBranding();
  const { licence } = usePharmacyDetails();
  const contact = branding.email || 'our support team';
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      updated="November 2026"
      sections={[
        {
          heading: 'Agreement to these terms',
          body: [
            `These terms govern your use of this website and every order you place with ${branding.name} ("we", "us", "our"). By browsing the site, creating an account or placing an order, you confirm that you have read and accept them, together with our Shipping Policy, Returns & Refunds policy and Privacy Policy, which form part of this agreement.`,
            'If you do not agree, please do not use the site or place an order.',
          ],
        },
        {
          heading: 'About us',
          body: [
            `${branding.name} is an online pharmacy operating in Kenya from ${branding.address}. Our pharmacy is licensed and regulated by the Pharmacy and Poisons Board (PPB)${licence ? ` under licence no. ${licence}` : ''}, and medicines are supplied under the supervision of a registered pharmacist in line with the Pharmacy and Poisons Act and its regulations.`,
          ],
        },
        {
          heading: 'Who may use the site',
          body: [
            'You must be at least 18 years old to place an order. If you are ordering for someone else, such as a child or a relative, you confirm that you are authorised to do so and that the information you give about them is accurate.',
            'We supply and deliver within Kenya. We may refuse service where we reasonably believe an order is unsafe, unlawful or inappropriate.',
          ],
        },
        {
          heading: 'Your account',
          body: [
            'Creating an account is optional. You can check out as a guest. If you create an account, you must give accurate information and keep it up to date, and you are responsible for keeping your password secure and for everything done through your account.',
            'Tell us immediately if you think someone else has accessed your account. We may suspend or close an account that we reasonably believe is being misused or used unlawfully.',
          ],
        },
        {
          heading: 'Medical information and advice',
          body: [
            'The information on this website, including product descriptions, directions and warnings, is provided to help you shop and is not a substitute for professional medical advice, diagnosis or treatment. Always read the patient information leaflet supplied with a medicine and follow the directions of your doctor or pharmacist.',
            'Our pharmacists can answer questions about how to use a product, but they cannot diagnose conditions or replace a consultation with your doctor. If you think you may have a medical emergency, contact your doctor or the nearest emergency facility immediately. Do not rely on this website or on a chat message.',
          ],
        },
        {
          heading: 'Products and descriptions',
          body: [
            'We take care to describe products accurately, but pack designs, ingredients and leaflets are controlled by manufacturers and can change. Images are for illustration. If a product you receive differs in a way that matters to you, please contact us before using it.',
            'Availability is not guaranteed until we confirm your order. We may limit the quantity of any product, particularly medicines where a limit is appropriate for safety.',
          ],
        },
        {
          heading: 'Prescription-only medicines',
          body: [
            'Prescription-only medicines (POM) are supplied only against a valid prescription. By ordering one, you confirm that:',
          ],
          list: [
            'the prescription is genuine, current and issued to the patient the medicine is for',
            'you have not altered it, and you will not use it to obtain the same medicine elsewhere beyond what the prescriber authorised',
            'the information you give us about the patient, including allergies and other medicines being taken, is complete and accurate',
          ],
          after: [
            'Our pharmacists verify every prescription before dispatch. We may contact you or your prescriber to confirm details, ask for further information, supply a different quantity from the one requested, or refuse to supply where we are not satisfied that supply is safe or lawful. We keep records of prescriptions as the law requires.',
          ],
        },
        {
          heading: 'Pharmacy and age-restricted products',
          body: [
            'Some products are sold only under pharmacist supervision, and some are for adults only. We may ask you to answer questions or confirm your age before supplying them, and the person receiving the order may need to show ID. We may decline to supply any product where we are not satisfied that it is appropriate.',
          ],
        },
        {
          heading: 'Placing an order',
          body: [
            'When you place an order you make an offer to buy the items in it. Your order confirmation tells you we have received it, but it is not our acceptance. A contract is formed when we confirm that your order, and any prescription it needs, has been accepted and we dispatch it or make it ready for pickup.',
            'We may decline or cancel an order, in whole or in part, for example if an item is unavailable, a prescription cannot be verified, a price is clearly wrong or we suspect fraud. If we cancel after you have paid, we will refund you in full.',
          ],
        },
        {
          heading: 'Prices and payment',
          body: [
            'Prices are shown in Kenyan Shillings (KES). They include applicable taxes unless stated otherwise. Delivery fees, where they apply, are shown at checkout before you pay. Prices and promotions can change at any time, but a change does not affect an order we have already accepted.',
            'If a product is listed at an obvious pricing error, we may cancel the order and refund you, or offer to supply it at the correct price.',
            'We accept M-PESA and cash on delivery. Payments are processed by our payment partners over encrypted connections. We never see or store your M-PESA PIN. For cash on delivery, payment is due when you receive your order.',
          ],
        },
        {
          heading: 'Delivery, pickup and risk',
          body: [
            'How and when we deliver is set out in our Shipping Policy. Delivery times are estimates, not guarantees. Risk in the goods passes to you when they are delivered to you or collected by you. Ownership passes when we receive full payment.',
          ],
        },
        {
          heading: 'Returns and refunds',
          body: [
            'Our Returns & Refunds policy explains what you can return and how refunds work. In short, medicines cannot be returned once they have left our pharmacy for safety reasons, but we will replace or refund any item that is wrong, damaged, expired or missing, as long as you contact us within 24 hours of delivery. Nothing in this agreement limits any right you have under Kenyan consumer protection law.',
          ],
        },
        {
          heading: 'Acceptable use',
          body: ['When using this website you agree not to:'],
          list: [
            'submit a false, altered or stolen prescription, or give false information about a patient',
            'place orders or use the site for any unlawful purpose, or to obtain medicines for resale or misuse',
            'attempt to gain unauthorised access to the site, other accounts or our systems, or to interfere with the site’s operation',
            'use automated tools to scrape the site, place bulk orders or bypass limits we set',
            'post or send anything abusive, defamatory or unlawful through our forms, reviews or chat',
          ],
          after: [
            'We may refuse service, cancel orders, close accounts and report suspected unlawful activity, including to the Pharmacy and Poisons Board and the police.',
          ],
        },
        {
          heading: 'Reviews and content you submit',
          body: [
            'If you submit a review or other content, you confirm that it is honest, that you own it or have the right to share it and that it does not break the law. You give us a free, non-exclusive right to display it on the site and in our marketing. We may remove content that breaks these terms.',
          ],
        },
        {
          heading: 'Intellectual property',
          body: [
            `The website, its design, text, logos, graphics and software belong to ${branding.name} or our licensors and are protected by copyright and other laws. Product names, brands and images belong to their owners. You may view and print pages for your own personal use, but you may not copy, reproduce or exploit them commercially without our written permission.`,
          ],
        },
        {
          heading: 'Links to other websites',
          body: [
            'This site may link to websites run by other people. We do not control them and are not responsible for their content or privacy practices. Following a link is at your own risk.',
          ],
        },
        {
          heading: 'Our responsibility to you',
          body: [
            'We will supply your order with reasonable care and skill. Nothing in these terms excludes or limits our liability for death or personal injury caused by our negligence, for fraud or for anything else that cannot be limited under Kenyan law.',
            'Subject to that, we are not liable for indirect or consequential loss, for loss of profit or for delays or failures caused by events outside our reasonable control. Our total liability for any order is limited to the price you paid for it. Medicines are not suitable for everybody, and you remain responsible for using them as directed by your prescriber, pharmacist and the leaflet.',
          ],
        },
        {
          heading: 'Site availability',
          body: [
            'We work to keep the site available and accurate, but we do not promise it will be uninterrupted or error-free. We may change, suspend or withdraw any part of it for maintenance or other reasons.',
          ],
        },
        {
          heading: 'Governing law and disputes',
          body: [
            'These terms are governed by the laws of Kenya. If you have a complaint, please contact us first so we can try to resolve it quickly. If we cannot, the courts of Kenya have jurisdiction over any dispute, without limiting any right you have to bring a complaint before a regulator or consumer body.',
          ],
        },
        {
          heading: 'Changes to these terms',
          body: [
            'We may update these terms from time to time. The date at the top shows when they were last changed. Changes apply to orders placed after the update, and continued use of the site means you accept the revised terms.',
          ],
        },
        {
          heading: 'Contact us',
          body: [
            `Questions about these terms can be sent to ${contact}, to WhatsApp at ${branding.whatsapp}, or by phone on ${branding.phone}.`,
          ],
        },
      ]}
    />
  );
}
