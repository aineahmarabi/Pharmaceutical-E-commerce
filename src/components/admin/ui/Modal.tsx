'use client';

import React, { useEffect, useRef } from 'react';
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
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', handleKey);
    const firstFocusable = dialogRef.current?.querySelector<HTMLElement>('button, input, textarea, select, a[href]');
    firstFocusable?.focus();
    return () => document.removeEventListener('keydown', handleKey);
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
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-modal-title"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative bg-p-bg-surface rounded-2xl shadow-p-modal w-full max-w-[620px] max-h-[85vh] flex flex-col"
          >
            <div className="flex items-start justify-between px-5 pt-5 flex-shrink-0">
              <h2 id="admin-modal-title" className="text-xl font-semibold text-p-text">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="text-p-text-subdued hover:text-p-text">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[70vh]">{children}</div>
            {(primaryAction || secondaryAction) && (
              <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-p-border-subdued flex-shrink-0">
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
