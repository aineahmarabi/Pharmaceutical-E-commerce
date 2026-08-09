import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeStatus = 'default' | 'success' | 'warning' | 'critical' | 'info';

const statusClasses: Record<BadgeStatus, string> = {
  default: 'bg-[#E4E5E7] text-p-text',
  success: 'bg-p-success text-[#166534]',
  warning: 'bg-p-warning text-[#92400E]',
  critical: 'bg-[#FED3D1] text-[#B81900]',
  info: 'bg-p-info text-[#0369A1]',
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
        'inline-flex items-center gap-1 rounded-[10px] px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        statusClasses[status],
        className
      )}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />}
      {children}
    </span>
  );
}
