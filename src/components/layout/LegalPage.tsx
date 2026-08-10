'use client';

import React from 'react';
import { motion } from 'framer-motion';

const ease = [0.16, 1, 0.3, 1] as const;

export interface LegalSection {
  heading: string;
  body: string[];
}

export function LegalPage({ eyebrow, title, updated, sections }: { eyebrow: string; title: string; updated: string; sections: LegalSection[] }) {
  return (
    <div className="min-h-screen bg-porcelain py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          <p className="font-mono text-xs uppercase tracking-widest text-petrol-300 mb-1">{eyebrow}</p>
          <h1 className="font-display font-bold text-2xl text-ink tracking-tight">{title}</h1>
          <p className="text-xs text-ink/40 mt-1.5">Last updated {updated}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease }}
          className="mt-8 bg-paper rounded-2xl border border-line p-6 sm:p-8 space-y-8"
        >
          {sections.map((section) => (
            <div key={section.heading}>
              <h2 className="font-display font-bold text-base text-ink tracking-tight mb-2.5">{section.heading}</h2>
              <div className="space-y-3">
                {section.body.map((p, i) => (
                  <p key={i} className="text-sm text-ink/70 leading-relaxed">{p}</p>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
