import React from 'react';
import { cn } from '@/lib/utils';
import type { ProductClass } from '@/lib/fixtures/types';

interface ClassBadgeProps {
  classification: ProductClass;
  className?: string;
}

const styles: Record<ProductClass, string> = {
  OTC: 'bg-porcelain text-muted-fg border-line',
  P: 'bg-porcelain text-ink border-line',
  POM: 'bg-porcelain text-ink border-ink/50',
};

const titles: Record<ProductClass, string> = {
  OTC: 'Over the Counter: no prescription needed',
  P: 'Pharmacy Medicine: sold under pharmacist supervision',
  POM: 'Prescription Only Medicine: requires a valid prescription',
};

export function ClassBadge({ classification, className }: ClassBadgeProps) {
  return (
    <span
      title={titles[classification]}
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 rounded-md border text-xs font-semibold leading-none',
        styles[classification],
        className
      )}
    >
      {classification}
    </span>
  );
}
