'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Stethoscope, X, Search } from 'lucide-react';

interface GlossaryTerm {
  term: string;
  definition: string;
  category: 'Classification' | 'General';
}

const TERMS: GlossaryTerm[] = [
  { term: 'OTC — Over the Counter', definition: 'Medicines you can buy freely, without a doctor\'s prescription.', category: 'Classification' },
  { term: 'P — Pharmacy Medicine', definition: 'Can only be sold under the supervision of a registered pharmacist, but no prescription is needed.', category: 'Classification' },
  { term: 'POM — Prescription Only Medicine', definition: 'Requires a valid prescription from a licensed prescriber before we can dispense it to you.', category: 'Classification' },
  { term: 'Generic name', definition: 'The official medical name of a medicine\'s active ingredient, as opposed to its brand name (e.g. "Paracetamol" vs "Panadol").', category: 'General' },
  { term: 'Active ingredient', definition: 'The substance in a medicine that is responsible for its effect on the body.', category: 'General' },
  { term: 'Dosage form', definition: 'The physical form a medicine comes in — tablet, capsule, syrup, cream, drops, and so on.', category: 'General' },
  { term: 'Strength', definition: 'The amount of active ingredient in each dose, e.g. "500mg" per tablet.', category: 'General' },
  { term: 'Dispensing pharmacist', definition: 'The licensed professional who reviews your prescription and prepares your order before it ships.', category: 'General' },
  { term: 'Contraindication', definition: 'A condition, medicine, or factor that makes a particular treatment inadvisable or unsafe for you.', category: 'General' },
  { term: 'Side effect', definition: 'An unintended effect a medicine can cause alongside its main, intended effect.', category: 'General' },
  { term: 'Expiry date', definition: 'The date after which a medicine should no longer be used, printed on the pack.', category: 'General' },
  { term: 'Delivery zone', definition: 'The area we deliver your order to — each zone has its own delivery fee, set at checkout.', category: 'General' },
];

export function MedicalGlossary() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return TERMS;
    return TERMS.filter((t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q));
  }, [search]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open medical terms glossary"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex fixed top-[75%] -translate-y-1/2 right-0 z-40 items-center gap-2 pl-3.5 pr-4 py-3 bg-petrol text-paper rounded-l-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.25)] border border-petrol-700/40 hover:bg-petrol-700 hover:pr-5 transition-all"
      >
        <Stethoscope size={17} strokeWidth={2} />
        <span className="text-[13px] font-semibold tracking-wide whitespace-nowrap">Medical Terms</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="glossary-title"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              className="fixed inset-y-0 right-0 z-[60] w-full max-w-sm bg-paper shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-5 h-16 border-b border-line flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Stethoscope size={18} className="text-petrol" />
                  <h2 id="glossary-title" className="font-display font-bold text-lg text-ink">Medical terms</h2>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Close" className="w-9 h-9 rounded-xl hover:bg-petrol-50 flex items-center justify-center transition-colors">
                  <X size={18} className="text-ink" />
                </button>
              </div>

              <div className="px-5 py-4 border-b border-line flex-shrink-0">
                <p className="text-sm text-ink/60 leading-relaxed mb-3">
                  Not sure what a label or term on the site means? Search or browse explanations below.
                </p>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-petrol-300" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search terms, e.g. &quot;POM&quot;"
                    className="w-full bg-porcelain border border-line rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-petrol transition-colors"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
                {filtered.length === 0 ? (
                  <p className="text-sm text-ink/50 text-center py-8">No terms match "{search}".</p>
                ) : (
                  <ul className="space-y-4">
                    {filtered.map((t) => (
                      <li key={t.term} className="pb-4 border-b border-line/60 last:border-b-0 last:pb-0">
                        <p className="font-semibold text-sm text-ink">{t.term}</p>
                        <p className="text-sm text-ink/60 leading-relaxed mt-1">{t.definition}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
