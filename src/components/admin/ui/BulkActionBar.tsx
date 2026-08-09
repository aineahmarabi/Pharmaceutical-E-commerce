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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-p-bg-inverse text-white h-14 px-4 rounded-lg shadow-p-modal max-w-[calc(100vw-2rem)] overflow-x-auto"
        >
          <button onClick={onDeselect} aria-label="Deselect all" className="p-1.5 rounded hover:bg-white/10 flex-shrink-0">
            <X size={16} />
          </button>
          <span className="text-sm font-medium px-2 flex-shrink-0">{selectedCount} selected</span>
          <div className="flex items-center gap-1">
            {actions.map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                className="text-sm px-3 py-1.5 rounded hover:bg-white/10 transition-colors whitespace-nowrap"
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
