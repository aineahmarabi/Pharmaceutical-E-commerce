import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeStatus = 'default' | 'success' | 'warning' | 'critical' | 'info';

// Status colour lives only here. Text colours are dark enough for AA on their tints.
const statusClasses: Record<BadgeStatus, string> = {
  default: 'bg-p-bg-surface-active text-p-text',
  success: 'bg-p-success-subdued text-[#14532D] ring-1 ring-inset ring-[#BBF7D0]',
  warning: 'bg-p-warning-subdued text-[#78350F] ring-1 ring-inset ring-[#FDE68A]',
  critical: 'bg-p-critical-subdued text-[#991B1B] ring-1 ring-inset ring-[#FECACA]',
  info: 'bg-p-info-subdued text-[#075985] ring-1 ring-inset ring-[#BAE6FD]',
};

export function Badge({
  status = 'default',
  dot = false,
  children,
  className,
}: {
  status?: BadgeStatus;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        statusClasses[status],
        className
      )}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />}
      {children}
    </span>
  );
}
