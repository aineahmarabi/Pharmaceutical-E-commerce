import React from 'react';
import { PackageSearch } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  icon: Icon = PackageSearch,
  heading,
  body,
  action,
}: {
  icon?: React.ElementType;
  heading: string;
  body?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center text-center py-10 px-5">
      <Icon size={48} className="text-p-text-disabled mb-4" />
      <h3 className="text-base font-semibold text-p-text mb-2">{heading}</h3>
      {body && <p className="text-sm text-p-text-subdued max-w-[400px] mb-4">{body}</p>}
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
