'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ToastMsg {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextValue {
  toast: (message: string, opts?: { actionLabel?: string; onAction?: () => void }) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useAdminToast() {
  return useContext(ToastContext);
}

export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, opts?: { actionLabel?: string; onAction?: () => void }) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, ...opts }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[500] flex flex-col-reverse gap-2 items-center w-[calc(100vw-2rem)] max-w-md pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="pointer-events-auto flex items-center gap-3 w-full bg-p-bg-inverse text-white pl-4 pr-2 py-2.5 rounded-xl shadow-p-modal"
            >
              <span className="text-sm flex-1 py-0.5">{t.message}</span>
              {t.actionLabel && (
                <button
                  onClick={() => {
                    t.onAction?.();
                    dismiss(t.id);
                  }}
                  className="text-sm font-semibold underline underline-offset-2 hover:no-underline rounded px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {t.actionLabel}
                </button>
              )}
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
