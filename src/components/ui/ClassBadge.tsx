import React from 'react';
import { cn } from '@/lib/utils';
import type { ProductClass } from '@/lib/fixtures/types';

interface ClassBadgeProps {
  classification: ProductClass;
  className?: string;
}

const styles: Record<ProductClass, string> = {
  OTC: 'bg-petrol-50 text-petrol border border-petrol/20',
  P: 'bg-amber/10 text-amber border border-amber/20',
  POM: 'bg-signal/10 text-signal border border-signal/20',
};

const labels: Record<ProductClass, string> = {
  OTC: 'OTC',
  P: 'P',
  POM: 'POM',
};

export function ClassBadge({ classification, className }: ClassBadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wide', styles[classification], className)}>
      {labels[classification]}
    </span>
  );
}
