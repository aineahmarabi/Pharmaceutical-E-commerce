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
    <div className="border-b border-p-border-subdued -mt-2 mb-4">
      <div className="flex gap-1">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href) && (tab.href !== '/admin/products' || !pathname.startsWith('/admin/products/'));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'px-4 py-3 text-sm border-b-[3px] -mb-px transition-colors',
                active ? 'text-p-text font-semibold border-p-primary' : 'text-p-text-subdued font-medium border-transparent hover:text-p-text hover:bg-p-bg'
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
