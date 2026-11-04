'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';

export function ContextualSaveBar({
  isDirty,
  onSave,
  onDiscard,
  saving = false,
}: {
  isDirty: boolean;
  onSave: () => void;
  onDiscard: () => void;
  saving?: boolean;
}) {
  return (
    <AnimatePresence>
      {isDirty && (
        <motion.div
          role="region"
          aria-label="Unsaved changes"
          initial={{ y: -56 }}
          animate={{ y: 0 }}
          exit={{ y: -56 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
          className="sticky top-0 z-30 flex items-center justify-between gap-3 h-14 px-4 sm:px-6 bg-p-bg-inverse text-white -mx-4 sm:-mx-6 lg:-mx-8"
        >
          <p className="text-sm font-medium">Unsaved changes</p>
          <div className="flex items-center gap-2">
            <button
              onClick={onDiscard}
              className="h-8 px-3 text-sm font-semibold rounded-lg border border-white/40 text-white hover:bg-white/10 active:scale-[0.97] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Discard
            </button>
            <Button variant="primary" size="sm" loading={saving} onClick={onSave} className="ring-1 ring-white/30">
              Save
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
