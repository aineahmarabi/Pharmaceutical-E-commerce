import React from 'react';
import { Button } from './Button';

// `icon` is accepted for API compatibility but intentionally not rendered:
// empty states are typographic, with a clear next step.
export function EmptyState({
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
    <div className="flex flex-col items-center text-center py-12 px-5">
      <h3 className="text-base font-semibold text-p-text">{heading}</h3>
      {body && <p className="text-sm text-p-text-subdued max-w-[400px] mt-1">{body}</p>}
      {action && (
        <div className="mt-4">
          <Button variant="primary" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
