import React from 'react';
import { Info, AlertTriangle, XCircle, CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type BannerStatus = 'info' | 'warning' | 'critical' | 'success';

const config: Record<BannerStatus, { bg: string; border: string; icon: React.ElementType; text: string }> = {
  info: { bg: 'bg-p-info-subdued', border: 'border-p-focus', icon: Info, text: 'text-p-focus' },
  warning: { bg: 'bg-p-warning-subdued', border: 'border-[#916A00]', icon: AlertTriangle, text: 'text-[#916A00]' },
  critical: { bg: 'bg-p-critical-subdued', border: 'border-p-critical', icon: XCircle, text: 'text-p-critical' },
  success: { bg: 'bg-p-success-subdued', border: 'border-p-primary', icon: CheckCircle, text: 'text-p-primary' },
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
  const { bg, border, icon: Icon, text } = config[status];
  return (
    <div
      role={status === 'critical' ? 'alert' : 'status'}
      className={cn('rounded-lg p-4 border-l-4 flex gap-3', bg, border)}
    >
      <Icon size={18} className={cn('flex-shrink-0 mt-0.5', text)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-p-text">{title}</p>
        {children && <div className="text-sm text-p-text mt-1">{children}</div>}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss" className="text-p-text-subdued hover:text-p-text flex-shrink-0">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
