import React from 'react';
import { PackageSearch } from 'lucide-react';
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
      <div className="w-14 h-14 rounded-2xl bg-petrol-50 flex items-center justify-center mb-4">
        <PackageSearch size={24} className="text-petrol-300" />
      </div>
      <h3 className="font-display font-semibold text-ink text-lg">{title}</h3>
      {description && <p className="text-petrol-300 text-sm mt-1.5 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
