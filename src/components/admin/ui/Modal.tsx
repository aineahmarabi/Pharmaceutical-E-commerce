'use client';

import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './Button';

export interface ModalAction {
  label: string;
  onClick: () => void;
  destructive?: boolean;
  loading?: boolean;
}

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  children,
  primaryAction,
  secondaryAction,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  primaryAction?: ModalAction;
  secondaryAction?: ModalAction;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    // Focus the first form field if present, otherwise the first control.
    const field = dialogRef.current?.querySelector<HTMLElement>('input, textarea, select');
    const firstFocusable = field ?? dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    firstFocusable?.focus();
    return () => {
      document.removeEventListener('keydown', handleKey);
      previouslyFocused?.focus?.();
    };
    // Intentionally excludes onClose: it's a fresh closure on every parent
    // render, and re-running this on every keystroke would re-steal focus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            className="relative bg-p-bg-surface rounded-xl shadow-p-modal w-full max-w-[620px] max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between gap-4 px-5 h-14 border-b border-p-border-subdued flex-shrink-0">
              <h2 id={titleId} className="text-base font-semibold text-p-text">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 -mr-2 flex items-center justify-center rounded-lg text-p-text-subdued hover:text-p-text hover:bg-p-bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p-focus"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto admin-scroll">{children}</div>
            {(primaryAction || secondaryAction) && (
              <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-p-border-subdued flex-shrink-0 bg-p-bg-surface-subdued rounded-b-xl">
                {secondaryAction && (
                  <Button variant="secondary" onClick={secondaryAction.onClick}>
                    {secondaryAction.label}
                  </Button>
                )}
                {primaryAction && (
                  <Button
                    variant={primaryAction.destructive ? 'destructive' : 'primary'}
                    onClick={primaryAction.onClick}
                    loading={primaryAction.loading}
                  >
                    {primaryAction.label}
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
