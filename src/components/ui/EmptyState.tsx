import React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-16 px-4', className)}>
      <h3 className="font-semibold tracking-tight text-ink text-lg">{title}</h3>
      {description && <p className="text-muted-fg text-sm mt-1.5 max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-5 flex flex-wrap items-center justify-center gap-3">{action}</div>}
    </div>
  );
}
