'use client';

import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [activeIdx, setActiveIdx] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top?: number; bottom?: number; left: number; width: number } | null>(null);
  const id = useId();
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const close = () => setOpen(false);
    document.addEventListener('mousedown', handleClick);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [open]);

  // The menu is drawn on top of the page (not inside the table or card), so scroll containers cannot clip it.
  // It opens downwards, or upwards when there is not enough room below.
  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const r = buttonRef.current.getBoundingClientRect();
    const needed = Math.min(options.length * 36 + 8, 248);
    const below = window.innerHeight - r.bottom;
    setPos(
      below >= needed + 8 || below >= r.top
        ? { top: r.bottom + 4, left: r.left, width: r.width }
        : { bottom: window.innerHeight - r.top + 4, left: r.left, width: r.width },
    );
  }, [open, options.length]);

  const openMenu = () => {
    setActiveIdx(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const choose = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Escape' && open) {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) openMenu();
      else setActiveIdx((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) openMenu();
      else setActiveIdx((i) => Math.max(i - 1, 0));
    } else if ((e.key === 'Enter' || e.key === ' ') && open) {
      e.preventDefault();
      const opt = options[activeIdx];
      if (opt) choose(opt.value);
    }
  };

  return (
    <div ref={rootRef} className={cn('relative', className)} onKeyDown={onKeyDown}>
      {label && (
        <label id={`${id}-label`} className="block text-sm font-medium text-p-text mb-1">
          {label}
        </label>
      )}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={label ? `${id}-label` : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        className={cn(
          'h-9 w-full rounded-lg px-3 text-sm text-p-text bg-p-bg-surface border border-p-border-input transition-colors',
          'flex items-center justify-between gap-2 hover:bg-p-bg-surface-hover',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-p-focus/40 focus-visible:border-p-focus',
          'disabled:opacity-50 disabled:pointer-events-none',
          open && 'border-p-focus ring-2 ring-p-focus/30'
        )}
      >
        <span className="truncate">{current?.label ?? 'Select...'}</span>
        <ChevronDown size={14} className={cn('text-p-icon flex-shrink-0 transition-transform duration-150', open && 'rotate-180')} />
      </button>
      {open && pos && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          style={{ position: 'fixed', top: pos.top, bottom: pos.bottom, left: pos.left, width: pos.width }}
          className="admin-scroll z-[1000] max-h-60 overflow-y-auto bg-p-bg-surface border border-p-border-subdued rounded-lg shadow-p-popover py-1"
        >
          {options.map((opt, i) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              onMouseEnter={() => setActiveIdx(i)}
              onClick={() => choose(opt.value)}
              className={cn(
                'w-full flex items-center justify-between gap-2 text-left px-3 h-9 text-sm transition-colors',
                i === activeIdx && 'bg-p-bg-surface-hover',
                opt.value === value ? 'text-p-text font-medium' : 'text-p-text'
              )}
            >
              {opt.label}
              {opt.value === value && <Check size={14} className="text-p-primary flex-shrink-0" />}
            </button>
          ))}
        </div>,
        document.body,
      )}
      {helpText && <p className="mt-1 text-xs text-p-text-subdued">{helpText}</p>}
    </div>
  );
}
