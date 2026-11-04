'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, LayoutDashboard, ShoppingBag, FileCheck2, Package, Boxes, Users, LayoutGrid, Stethoscope, Tag,
  Percent, Mail, Newspaper, Store, BarChart3, UserCog, Settings, ExternalLink, type LucideIcon,
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { useAdminQuery } from '@/hooks/useAdminApi';
import { api } from '../../../convex/_generated/api';
import { useBranding } from '@/hooks/useBranding';
import { useAdminSession } from '@/hooks/useAdminSession';
import { canAccessRoute, ROLE_LABELS } from '@/lib/permissions';

interface NavLeaf {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: number;
  indent?: boolean;
}

interface NavGroup {
  label?: string;
  items: NavLeaf[];
}

const navGroups: NavGroup[] = [
  {
    items: [
      { href: '/admin', label: 'Home', icon: LayoutDashboard, exact: true },
      { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
      { href: '/admin/prescriptions', label: 'Prescriptions', icon: FileCheck2 },
      { href: '/admin/products', label: 'Products', icon: Package },
      { href: '/admin/inventory', label: 'Inventory', icon: Boxes, indent: true },
      { href: '/admin/customers', label: 'Customers', icon: Users },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { href: '/admin/categories', label: 'Categories', icon: LayoutGrid },
      { href: '/admin/conditions', label: 'Conditions', icon: Stethoscope },
      { href: '/admin/brands', label: 'Brands', icon: Tag },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { href: '/admin/discounts', label: 'Discounts', icon: Percent },
      { href: '/admin/messages', label: 'Messages', icon: Mail },
      { href: '/admin/newsletter', label: 'Newsletter', icon: Newspaper },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/admin/pos', label: 'POS Terminal', icon: Store },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/admin/staff', label: 'Staff', icon: UserCog },
    ],
  },
];

const settingsNav: NavLeaf = { href: '/admin/settings', label: 'Settings', icon: Settings };

function isActive(pathname: string, item: NavLeaf) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href + '/');
}

function NavItem({ item, onClick }: { item: NavLeaf; onClick?: () => void }) {
  const pathname = usePathname();
  const active = isActive(pathname, item);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`relative flex items-center h-9 rounded-lg text-sm transition-colors duration-100 pr-3
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p-success/70
        ${item.indent ? 'pl-6' : 'pl-3'}
        ${active
          ? 'bg-white/10 text-white font-semibold'
          : 'text-on-deep/70 hover:bg-white/5 hover:text-white font-medium'}`}
    >
      {active && <span aria-hidden="true" className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-p-success" />}
      <item.icon size={17} aria-hidden="true" className={`mr-2.5 shrink-0 ${active ? 'text-p-success' : 'text-on-deep/55'}`} />
      <span className="truncate">{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-p-success text-p-text text-xs font-semibold tabular-nums flex items-center justify-center">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function SidebarContent({ onClose, showClose }: { onClose?: () => void; showClose?: boolean }) {
  const dynamicBranding = useBranding();
  const { role } = useAdminSession();
  const visible = (href: string) => role !== null && canAccessRoute(role, href);
  const orders = useAdminQuery(api.orders.listOrders, { limit: 200 });
  const pendingOrderCount = orders?.filter((o) => o.status === 'placed' || o.status === 'confirmed').length;
  const rxToken = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  const pendingRx = useQuery(api.prescriptions.list, rxToken ? { token: rxToken, status: 'pending' as const } : 'skip');
  const pendingRxCount = pendingRx?.length;
  const messages = useAdminQuery(api.messages.listMessages, role === 'super_admin' || role === 'admin' ? {} : 'skip');
  const unreadMessageCount = messages?.filter((m) => !m.read).length;
  const lowStock = useQuery(api.inventory.getLowStockAlerts, rxToken ? { token: rxToken } : 'skip');
  const lowStockCount = lowStock?.length;

  const withBadge = (item: NavLeaf): NavLeaf => {
    if (item.href === '/admin/orders' && pendingOrderCount) return { ...item, badge: pendingOrderCount };
    if (item.href === '/admin/prescriptions' && pendingRxCount) return { ...item, badge: pendingRxCount };
    if (item.href === '/admin/inventory' && lowStockCount) return { ...item, badge: lowStockCount };
    if (item.href === '/admin/messages' && unreadMessageCount) return { ...item, badge: unreadMessageCount };
    return item;
  };

  const groups = navGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => visible(i.href)) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-14 px-4 border-b border-white/10 flex-shrink-0 gap-3">
        <div className={`w-9 h-9 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold ${dynamicBranding.logo ? '' : 'rounded-lg bg-p-primary ring-1 ring-white/25'}`}>
          {dynamicBranding.logo ? (
            // The monogram sits directly on the dark panel with a faint light outline, no box.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dynamicBranding.logoMark} alt="" className="brand-logo-glow h-full w-full object-contain" />
          ) : (
            (dynamicBranding.name || 'P').charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white leading-tight truncate">{dynamicBranding.name}</p>
          <p className="text-xs text-on-deep/60 leading-tight truncate">{role ? ROLE_LABELS[role] : 'Admin'}</p>
        </div>
        {showClose && (
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="w-9 h-9 -mr-2 rounded-lg flex items-center justify-center text-on-deep/70 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p-success/70"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto overscroll-contain admin-scroll py-3 px-3 space-y-5">
        {groups.map((group, gi) => (
          <div key={group.label ?? `g${gi}`}>
            {group.label && (
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-on-deep/45">{group.label}</p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem key={item.href} item={withBadge(item)} onClick={onClose} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3 flex-shrink-0 space-y-0.5">
        {visible(settingsNav.href) && <NavItem item={settingsNav} onClick={onClose} />}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center h-9 pl-3 pr-3 rounded-lg text-sm font-medium text-on-deep/60 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p-success/70"
        >
          <ExternalLink size={16} aria-hidden="true" className="mr-2.5 shrink-0 text-on-deep/55" />
          View storefront
        </a>
      </div>
    </div>
  );
}

export function AdminSidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen, onClose]);

  return (
    <>
      <aside
        id="admin-sidebar"
        className="hidden lg:flex flex-col w-60 flex-shrink-0 bg-deep border-r border-white/10"
      >
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/50 z-[300] lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-deep z-[300] lg:hidden flex flex-col shadow-p-modal"
            >
              <SidebarContent onClose={onClose} showClose />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
