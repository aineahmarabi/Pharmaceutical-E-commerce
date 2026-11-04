'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/inventory', label: 'Inventory' },
];

export function ProductsSubNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Products sections" className="border-b border-p-border-subdued mb-4">
      <div className="flex gap-1">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href) && (tab.href !== '/admin/products' || !pathname.startsWith('/admin/products/'));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'px-4 h-11 inline-flex items-center text-sm border-b-2 -mb-px transition-colors rounded-t-md',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-p-focus',
                active
                  ? 'text-p-text font-semibold border-p-primary'
                  : 'text-p-text-subdued font-medium border-transparent hover:text-p-text hover:bg-p-bg-surface-hover'
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
