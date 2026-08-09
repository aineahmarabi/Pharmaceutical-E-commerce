import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps {
  title?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  sectioned?: boolean;
  className?: string;
  padding?: 'normal' | 'compact';
}

export function Card({ title, headerAction, children, sectioned = false, className, padding = 'normal' }: CardProps) {
  const pad = padding === 'compact' ? 'p-3.5' : 'p-5';
  const padTop = padding === 'compact' ? 'px-3.5 pt-3.5' : 'px-5 pt-5';
  return (
    <div
      className={cn(
        'bg-p-bg-surface rounded-xl border border-p-border-subdued shadow-p-card transition-shadow duration-150 hover:shadow-p-popover',
        className
      )}
    >
      {title && (
        <div className={cn('flex items-center justify-between', padTop)}>
          <h3 className="text-base font-semibold text-p-text">{title}</h3>
          {headerAction && <div className="text-sm text-p-focus">{headerAction}</div>}
        </div>
      )}
      <div className={pad}>{children}</div>
    </div>
  );
}

export function CardDivider() {
  return <div className="border-t border-p-border-subdued -mx-5 my-4" />;
}
