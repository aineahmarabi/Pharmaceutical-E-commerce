'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/admin/ui/Button';

export interface PageHeaderAction {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: React.ElementType;
}

export function PageHeader({
  title,
  subtitle,
  backUrl,
  primaryAction,
  secondaryActions,
}: {
  title: string;
  subtitle?: string;
  backUrl?: string;
  primaryAction?: PageHeaderAction;
  secondaryActions?: PageHeaderAction[];
}) {
  return (
    <div className="py-5 mb-4">
      {backUrl && (
        <Link href={backUrl} className="text-sm text-p-focus hover:underline inline-block mb-2">
          ← Back
        </Link>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-p-text">{title}</h1>
          {subtitle && <p className="text-sm text-p-text-subdued mt-0.5">{subtitle}</p>}
        </div>
        {(primaryAction || (secondaryActions && secondaryActions.length > 0)) && (
          <div className="flex items-center gap-2">
            {secondaryActions?.map((action) =>
              action.href ? (
                <Link key={action.label} href={action.href}>
                  <Button variant="secondary" icon={action.icon}>{action.label}</Button>
                </Link>
              ) : (
                <Button key={action.label} variant="secondary" icon={action.icon} onClick={action.onClick}>
                  {action.label}
                </Button>
              )
            )}
            {primaryAction && (
              primaryAction.href ? (
                <Link href={primaryAction.href}>
                  <Button variant="primary" icon={primaryAction.icon}>{primaryAction.label}</Button>
                </Link>
              ) : (
                <Button variant="primary" icon={primaryAction.icon} onClick={primaryAction.onClick}>
                  {primaryAction.label}
                </Button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
