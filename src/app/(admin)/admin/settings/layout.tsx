'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, Truck, Users, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin/settings', label: 'Store details', description: 'Contact info, address & formats', icon: Store, exact: true },
  { href: '/admin/settings/shipping', label: 'Shipping and delivery', description: 'Delivery zones & rates', icon: Truck },
  { href: '/admin/staff', label: 'Users and permissions', description: 'Staff accounts & roles', icon: Users },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="pb-16 flex flex-col md:flex-row gap-0 md:gap-8 max-w-[998px] mx-auto">
      <nav aria-label="Settings navigation" className="md:w-64 flex-shrink-0 md:border-r md:border-p-border-subdued md:pr-5 py-5 md:py-6">
        <h1 className="text-xl font-semibold text-p-text mb-4">Settings</h1>
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors border',
                  active
                    ? 'bg-p-bg-surface-selected border-p-primary/20 text-p-text shadow-p-card'
                    : 'text-p-text border-transparent hover:bg-p-bg-surface hover:border-p-border-subdued hover:shadow-p-card'
                )}
              >
                <div
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                    active ? 'bg-p-primary text-white' : 'bg-p-bg text-p-icon group-hover:text-p-primary'
                  )}
                >
                  <Icon size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn('leading-tight truncate', active ? 'font-semibold' : 'font-medium')}>{item.label}</p>
                  <p className="text-[12px] text-p-text-subdued truncate leading-tight mt-0.5">{item.description}</p>
                </div>
                <ChevronRight size={14} className={cn('flex-shrink-0 text-p-text-disabled transition-transform', active && 'text-p-primary')} />
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="flex-1 min-w-0 py-5 md:py-6 max-w-[720px]">{children}</div>
    </div>
  );
}
