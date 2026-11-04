'use client';

import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function BulkActionBar({
  selectedCount,
  onDeselect,
  actions,
}: {
  selectedCount: number;
  onDeselect: () => void;
  actions: { label: string; onClick: () => void }[];
}) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          role="region"
          aria-label="Bulk actions"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-p-bg-inverse text-white h-12 px-2 rounded-xl shadow-p-modal max-w-[calc(100vw-2rem)] overflow-x-auto"
        >
          <button
            onClick={onDeselect}
            aria-label="Deselect all"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X size={16} />
          </button>
          <span className="text-sm font-medium px-2 flex-shrink-0 tabular-nums">{selectedCount} selected</span>
          <div className="w-px h-5 bg-white/20 mx-1 flex-shrink-0" />
          <div className="flex items-center gap-1">
            {actions.map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                className="text-sm h-8 px-3 rounded-lg hover:bg-white/10 active:scale-[0.97] transition whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {action.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
