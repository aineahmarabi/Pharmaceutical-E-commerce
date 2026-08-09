'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
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
          initial={{ y: -56 }}
          animate={{ y: 0 }}
          exit={{ y: -56 }}
          transition={{ duration: 0.2 }}
          className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 sm:px-6 bg-p-bg-inverse text-white -mx-4 sm:-mx-8"
        >
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle size={16} className="text-p-warning" />
            Unsaved changes
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDiscard}
              className="h-8 px-3 text-sm font-semibold rounded-md border border-white/30 text-white hover:bg-white/10 transition-colors"
            >
              Discard
            </button>
            <Button variant="primary" size="sm" loading={saving} onClick={onSave}>
              Save
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
