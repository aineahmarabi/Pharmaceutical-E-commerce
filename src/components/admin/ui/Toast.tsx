'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[500] flex flex-col-reverse gap-2 items-center"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 bg-p-bg-inverse text-white px-4 py-3 rounded-lg shadow-p-modal min-w-[300px]"
            >
              <span className="text-sm flex-1">{t.message}</span>
              {t.actionLabel && (
                <button
                  onClick={() => {
                    t.onAction?.();
                    setToasts((prev) => prev.filter((x) => x.id !== t.id));
                  }}
                  className="text-sm font-semibold text-[#2DD4BF] hover:underline"
                >
                  {t.actionLabel}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
