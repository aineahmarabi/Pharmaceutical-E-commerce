'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

const btn =
  'w-10 h-10 flex items-center justify-center text-ink hover:bg-porcelain active:scale-[0.97] transition-colors duration-100 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40';

export function QuantityStepper({ value, onChange, min = 1, max = 99, className }: QuantityStepperProps) {
  return (
    <div className={cn('inline-flex items-center border border-line bg-paper rounded-lg overflow-hidden', className)} role="group" aria-label="Quantity">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} className={btn} aria-label="Decrease quantity">
        <Minus size={14} />
      </button>
      <span className="w-10 text-center text-sm font-semibold tabular-nums text-ink select-none" aria-live="polite">
        {value}
      </span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} className={btn} aria-label="Increase quantity">
        <Plus size={14} />
      </button>
    </div>
  );
}
