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
  dark?: boolean;
}

export function Breadcrumb({ items, className, dark = false }: BreadcrumbProps) {
  const base = dark ? 'text-paper/50 hover:text-paper/80' : 'text-petrol-300 hover:text-petrol';
  const current = dark ? 'text-paper/80' : 'text-ink';

  return (
    <nav className={cn('flex items-center flex-wrap gap-1.5 text-xs', className)} aria-label="Breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <React.Fragment key={`${item.label}-${i}`}>
            {i > 0 && <ChevronRight size={11} className={dark ? 'text-paper/30' : 'text-line'} />}
            {item.href && !isLast ? (
              <Link href={item.href} className={cn('transition-colors', base)}>
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? current : base}>{item.label}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
