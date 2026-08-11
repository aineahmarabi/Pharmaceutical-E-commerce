'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled,
  className,
  buttonClassName,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      {label && (
        <label id={`${id}-label`} className="block text-sm font-medium text-ink mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={label ? `${id}-label` : undefined}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full h-[42px] rounded-xl px-3.5 text-sm text-ink bg-paper border border-line transition-colors',
          'flex items-center justify-between gap-2',
          'focus:outline-none focus:border-petrol',
          'disabled:opacity-50 disabled:pointer-events-none',
          open && 'border-petrol',
          buttonClassName
        )}
      >
        <span className={cn('truncate', !current && 'text-ink/40')}>{current?.label ?? placeholder}</span>
        <ChevronDown size={15} className={cn('text-petrol-300 flex-shrink-0 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-20 mt-1.5 w-full max-h-60 overflow-y-auto overscroll-contain bg-paper border border-line rounded-xl shadow-lg py-1.5"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={opt.value === value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between gap-2 text-left px-3.5 py-2 text-sm hover:bg-petrol-50 transition-colors',
                  opt.value === value ? 'text-ink font-medium' : 'text-ink/70'
                )}
              >
                {opt.label}
                {opt.value === value && <Check size={14} className="text-petrol flex-shrink-0" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
