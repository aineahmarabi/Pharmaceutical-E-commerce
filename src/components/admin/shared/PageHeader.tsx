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
  backLabel = 'Back',
  primaryAction,
  secondaryActions,
}: {
  title: string;
  subtitle?: string;
  backUrl?: string;
  /** Label for the breadcrumb back link (defaults to "Back"). */
  backLabel?: string;
  primaryAction?: PageHeaderAction;
  secondaryActions?: PageHeaderAction[];
}) {
  return (
    <div className="pt-6 pb-5">
      {backUrl && (
        <Link
          href={backUrl}
          className="inline-flex items-center h-6 mb-2 -ml-1 px-1 rounded text-sm text-p-text-subdued hover:text-p-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p-focus"
        >
          <span aria-hidden="true" className="mr-1">&larr;</span>
          {backLabel}
        </Link>
      )}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-p-text leading-8">{title}</h1>
          {subtitle && <p className="text-sm text-p-text-subdued mt-1">{subtitle}</p>}
        </div>
        {(primaryAction || (secondaryActions && secondaryActions.length > 0)) && (
          <div className="flex flex-wrap items-center gap-2">
            {secondaryActions?.map((action) =>
              action.href ? (
                <Link key={action.label} href={action.href} className="rounded-lg focus-visible:outline-none">
                  <Button variant="secondary" icon={action.icon} tabIndex={-1}>{action.label}</Button>
                </Link>
              ) : (
                <Button key={action.label} variant="secondary" icon={action.icon} onClick={action.onClick}>
                  {action.label}
                </Button>
              )
            )}
            {primaryAction && (
              primaryAction.href ? (
                <Link href={primaryAction.href} className="rounded-lg focus-visible:outline-none">
                  <Button variant="primary" icon={primaryAction.icon} tabIndex={-1}>{primaryAction.label}</Button>
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
