'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useStockWatch } from '@/hooks/useStockWatch';

const ease = [0.16, 1, 0.3, 1] as const;

/** Pops up when a product the visitor asked about is available again. Guests are recognised by this device. */
export function RestockNotice() {
  const { watched, unwatch } = useStockWatch();
  const back = watched.filter((p) => p.inStock);
  const first = back[0];

  return (
    <AnimatePresence>
      {first && (
        <motion.aside
          key={first.productId}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.4, ease }}
          className="fixed bottom-20 left-4 z-40 w-[calc(100vw-2rem)] max-w-sm rounded-xl border border-line bg-paper p-4 shadow-lg md:bottom-6"
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">Back in stock</p>
              <p className="mt-0.5 truncate text-sm text-muted-fg">{first.name}</p>
              {back.length > 1 && <p className="mt-0.5 text-xs text-muted-fg">and {back.length - 1} more you asked about</p>}
              <Link
                href={`/products/${first.slug}`}
                onClick={() => unwatch(first.productId)}
                className="mt-3 inline-flex h-9 items-center rounded-lg bg-petrol px-4 text-sm font-semibold text-white transition-colors hover:bg-petrol-700 active:scale-[0.97]"
              >
                View product
              </Link>
            </div>
            <button
              type="button"
              onClick={() => unwatch(first.productId)}
              aria-label="Dismiss"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-fg transition-colors hover:bg-porcelain hover:text-ink"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
