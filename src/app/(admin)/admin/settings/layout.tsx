'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin/settings', label: 'Store details', exact: true },
  { href: '/admin/settings/shipping', label: 'Shipping and delivery' },
  { href: '/admin/staff', label: 'Users and permissions' },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="pb-16 flex flex-col md:flex-row gap-2 md:gap-8">
      <nav aria-label="Settings navigation" className="md:w-56 flex-shrink-0 pt-5 md:pt-6">
        <h1 className="text-xl font-semibold text-p-text mb-3 px-1">Settings</h1>
        <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0 md:sticky md:top-20">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors',
                  active
                    ? 'bg-p-bg-surface text-p-text font-semibold border border-p-border-subdued'
                    : 'text-p-text-subdued border border-transparent hover:bg-p-bg-surface hover:text-p-text'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="flex-1 min-w-0 pt-2 md:pt-6 max-w-[760px]">{children}</div>
    </div>
  );
}
