'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

const faqs = [
  { q: 'Is it safe to buy medicines online?', a: 'Yes. All products on our platform are genuine and sourced directly from licensed manufacturers. We are regulated by the Pharmacy and Poisons Board (PPB) of Kenya.' },
  { q: 'Do you require a prescription for Rx medicines?', a: 'Prescription-Only Medicines (POM) require a valid prescription from a licensed healthcare provider. OTC and P-class medicines can be purchased without a prescription.' },
  { q: 'How fast is delivery?', a: 'We offer same-day delivery in Nairobi for orders placed before 2pm. Delivery to other towns takes 1–3 business days.' },
  { q: 'What is the return policy?', a: 'For safety reasons, medicines cannot be returned once dispensed. If you receive a wrong or damaged product, contact us within 24 hours and we will arrange a replacement at no cost.' },
  { q: 'Is my payment information secure?', a: 'Yes. All payments are processed over 256-bit SSL encryption. We support M-PESA, card (via Stripe), and cash on delivery.' },
  { q: 'Can I pick up in-store?', a: 'Yes. Select "Pick-up" at checkout and choose your nearest branch. Orders are usually ready within 30 minutes.' },
  { q: 'How do I track my order?', a: 'You will receive SMS and email updates at each stage of your order. You can also track in real time from My Account → Orders.' },
  { q: 'Do you deliver outside Kenya?', a: 'Currently we only deliver within Kenya. International orders are not supported at this time.' },
];

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left py-5 flex items-start justify-between gap-4"
      >
        <span className="font-semibold text-sm text-ink leading-snug">{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
          <ChevronDown size={16} className="text-petrol-300" />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-ink/70 leading-relaxed pb-5">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-porcelain py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          <p className="font-mono text-xs uppercase tracking-widest text-petrol-300 mb-1">Help</p>
          <h1 className="font-display font-bold text-2xl text-ink tracking-tight">Frequently Asked Questions</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease }}
          className="mt-8 bg-paper rounded-2xl border border-line divide-y divide-line px-6"
        >
          {faqs.map((faq) => <FAQ key={faq.q} {...faq} />)}
        </motion.div>
      </div>
    </div>
  );
}
