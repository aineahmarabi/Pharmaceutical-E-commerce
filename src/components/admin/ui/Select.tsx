'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
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
  helpText,
  disabled,
  className,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  helpText?: string;
  disabled?: boolean;
  className?: string;
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
        <label id={`${id}-label`} className="block text-sm font-medium text-p-text mb-1">
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
          'h-9 w-full rounded px-3 text-sm text-p-text bg-p-bg-surface border border-p-border-input transition-colors',
          'flex items-center justify-between gap-2',
          'focus:outline-none focus-visible:shadow-[0_0_0_2px_var(--color-p-focus)]',
          'disabled:opacity-50 disabled:pointer-events-none',
          open && 'border-p-focus shadow-[0_0_0_1px_var(--color-p-focus)]'
        )}
      >
        <span className="truncate">{current?.label ?? 'Select...'}</span>
        <ChevronDown size={14} className={cn('text-p-icon-subdued flex-shrink-0 transition-transform duration-150', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          role="listbox"
          className="admin-scroll absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-p-bg-surface border border-p-border-subdued rounded-lg shadow-p-popover py-1"
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
                'w-full flex items-center justify-between gap-2 text-left px-3 py-1.5 text-sm hover:bg-p-bg transition-colors',
                opt.value === value ? 'text-p-text font-medium' : 'text-p-text-subdued'
              )}
            >
              {opt.label}
              {opt.value === value && <Check size={14} className="text-p-primary flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
      {helpText && <p className="mt-1 text-[13px] text-p-text-subdued">{helpText}</p>}
    </div>
  );
}
