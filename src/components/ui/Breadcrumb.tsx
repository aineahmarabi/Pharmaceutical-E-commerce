import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  /** Kept for backwards compatibility; breadcrumbs now always use theme tokens. */
  dark?: boolean;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn('flex items-center flex-wrap gap-1.5 text-xs', className)} aria-label="Breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <React.Fragment key={`${item.label}-${i}`}>
            {i > 0 && <ChevronRight size={11} className="text-muted-fg/60" aria-hidden="true" />}
            {item.href && !isLast ? (
              <Link href={item.href} className="text-muted-fg hover:text-ink hover:underline underline-offset-2 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-ink font-medium' : 'text-muted-fg'} aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
