import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type BannerStatus = 'info' | 'warning' | 'critical' | 'success';

// Status is conveyed by a tinted surface and a left rule, not by icons.
const config: Record<BannerStatus, { bg: string; border: string }> = {
  info: { bg: 'bg-p-info-subdued', border: 'border-l-[#0369A1]' },
  warning: { bg: 'bg-p-warning-subdued', border: 'border-l-[#B45309]' },
  critical: { bg: 'bg-p-critical-subdued', border: 'border-l-p-critical' },
  success: { bg: 'bg-p-success-subdued', border: 'border-l-p-primary' },
};

export function Banner({
  status = 'info',
  title,
  children,
  onDismiss,
}: {
  status?: BannerStatus;
  title: string;
  children?: React.ReactNode;
  onDismiss?: () => void;
}) {
  const { bg, border } = config[status];
  return (
    <div
      role={status === 'critical' ? 'alert' : 'status'}
      className={cn('rounded-lg px-4 py-3 border border-p-border-subdued border-l-4 flex gap-3', bg, border)}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-p-text">{title}</p>
        {children && <div className="text-sm text-p-text mt-1">{children}</div>}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="text-p-text-subdued hover:text-p-text flex-shrink-0 self-start rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p-focus"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
