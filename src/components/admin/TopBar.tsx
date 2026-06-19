'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Bell, Search, ChevronRight } from 'lucide-react';
import { branding } from '@/lib/config/branding';

const routeLabels: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/orders': 'Orders',
  '/admin/pos': 'POS Terminal',
  '/admin/products': 'Products',
  '/admin/products/new': 'New Product',
  '/admin/categories': 'Categories',
  '/admin/conditions': 'Conditions',
  '/admin/brands': 'Brands',
  '/admin/inventory': 'Inventory',
  '/admin/customers': 'Customers',
  '/admin/staff': 'Staff',
  '/admin/analytics': 'Analytics',
  '/admin/audit-log': 'Audit Log',
  '/admin/settings': 'Settings',
};

function getTitle(pathname: string): string {
  if (routeLabels[pathname]) return routeLabels[pathname];
  const parent = Object.entries(routeLabels).find(([k]) => pathname.startsWith(k) && k !== '/admin')?.[1];
  return parent ?? 'Admin';
}

export function AdminTopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const title = getTitle(pathname);
  const isDetail = !routeLabels[pathname] && pathname !== '/admin';

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 bg-paper border-b border-line/60 gap-4">
      {/* Left: hamburger (mobile) + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-petrol-300 hover:text-ink hover:bg-petrol-50 transition-colors border border-line/60 flex-shrink-0"
        >
          <Menu size={16} />
        </button>

        <div className="flex items-center gap-1.5 min-w-0 text-sm">
          <span className="text-petrol-300 hidden sm:inline truncate">{branding.name}</span>
          <ChevronRight size={12} className="text-line hidden sm:block flex-shrink-0" />
          {isDetail && (
            <>
              <span className="text-petrol-300 truncate">{getTitle(pathname.split('/').slice(0, -1).join('/') || '/admin')}</span>
              <ChevronRight size={12} className="text-line flex-shrink-0" />
            </>
          )}
          <span className="font-semibold text-ink truncate">{title}</span>
        </div>
      </div>

      {/* Right: search + bell + avatar */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="hidden sm:flex items-center gap-2 h-8 px-3 text-sm text-petrol-300 hover:text-ink border border-line/60 rounded-lg hover:bg-petrol-50 transition-colors group">
          <Search size={13} />
          <span className="text-xs group-hover:text-ink transition-colors">Search</span>
          <kbd className="text-[10px] bg-line/60 rounded px-1 font-mono text-petrol-300 ml-1">⌘K</kbd>
        </button>

        <button
          aria-label="Notifications"
          className="relative w-8 h-8 rounded-lg flex items-center justify-center text-petrol-300 hover:text-ink hover:bg-petrol-50 transition-colors border border-line/60"
        >
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-signal ring-2 ring-paper" />
        </button>

        <div className="w-8 h-8 rounded-lg bg-petrol flex items-center justify-center flex-shrink-0" title="Administrator">
          <span className="font-mono font-bold text-paper text-xs select-none">A</span>
        </div>
      </div>
    </header>
  );
}
