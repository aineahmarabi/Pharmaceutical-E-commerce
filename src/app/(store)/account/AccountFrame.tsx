'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCustomerAuth } from '@/lib/auth/customerAuth';
import { cn } from '@/lib/utils';

const nav = [
  { label: 'Overview', href: '/account' },
  { label: 'Orders', href: '/account/orders' },
  { label: 'Wishlist', href: '/account/wishlist' },
  { label: 'Addresses', href: '/account/addresses' },
  { label: 'Profile', href: '/account/profile' },
];

export function AccountFrame({ title, description, children, actions }: { title: string; description?: string; children: React.ReactNode; actions?: React.ReactNode }) {
  const pathname = usePathname();
  const { customer, isAuthenticated, logout } = useCustomerAuth();

  return (
    <div className="min-h-screen bg-porcelain">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-4 lg:items-start space-y-4 lg:space-y-0">
        <aside className="bg-paper rounded-xl border border-line lg:sticky lg:top-24">
          {isAuthenticated && (
            <div className="hidden lg:block p-4 border-b border-line">
              <p className="text-sm font-semibold text-ink truncate">{customer?.name}</p>
              <p className="text-xs text-muted-fg truncate">{customer?.email}</p>
            </div>
          )}
          <nav aria-label="Account" className="flex lg:flex-col overflow-x-auto p-1.5 gap-1">
            {nav.map((n) => {
              const active = n.href === '/account' ? pathname === n.href : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40',
                    active ? 'bg-porcelain font-semibold text-ink' : 'text-muted-fg hover:text-ink hover:bg-porcelain'
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          {isAuthenticated && (
            <div className="hidden lg:block p-1.5 border-t border-line">
              <button onClick={logout} className="w-full text-left rounded-lg px-3 py-2 text-sm text-muted-fg hover:text-signal hover:bg-porcelain transition-colors">
                Log out
              </button>
            </div>
          )}
        </aside>

        <main className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink">{title}</h1>
              {description && <p className="text-sm text-muted-fg mt-1">{description}</p>}
            </div>
            {actions}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export const accountField =
  'w-full bg-paper border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-fg focus:outline-none focus:border-petrol focus:ring-2 focus:ring-petrol/40 transition-colors disabled:opacity-60 disabled:cursor-not-allowed';
export const primaryBtn =
  'bg-petrol hover:bg-petrol-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors active:scale-[0.97] duration-100 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40 focus-visible:ring-offset-2';
export const secondaryBtn =
  'border border-line bg-paper hover:bg-porcelain text-ink text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors active:scale-[0.97] duration-100';
