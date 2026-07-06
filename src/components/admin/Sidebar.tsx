'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingCart, Package, Tag, Activity, Boxes,
  Users, UserCircle, BarChart3, ClipboardList, Settings, LogOut,
  ChevronLeft, ChevronRight, Monitor, Store, X,
} from 'lucide-react';
import { branding } from '@/lib/config/branding';

const navGroups = [
  {
    label: 'Operations',
    items: [
      { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
      { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
      { href: '/admin/pos', icon: Monitor, label: 'POS Terminal' },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { href: '/admin/products', icon: Package, label: 'Products' },
      { href: '/admin/categories', icon: Tag, label: 'Categories' },
      { href: '/admin/conditions', icon: Activity, label: 'Conditions' },
      { href: '/admin/brands', icon: Boxes, label: 'Brands' },
      { href: '/admin/inventory', icon: Boxes, label: 'Inventory' },
    ],
  },
  {
    label: 'People',
    items: [
      { href: '/admin/customers', icon: Users, label: 'Customers' },
      { href: '/admin/staff', icon: UserCircle, label: 'Staff' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

function NavItem({ href, icon: Icon, label, exact, collapsed, onClick }: {
  href: string; icon: React.ElementType; label: string; exact?: boolean;
  collapsed: boolean; onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`
        relative flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150 group
        ${collapsed ? 'h-9 w-9 justify-center mx-auto' : 'px-3 py-2 w-full'}
        ${active
          ? 'bg-white/10 text-white'
          : 'text-white/55 hover:text-white hover:bg-white/8'}
      `}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-signal rounded-r-full" />
      )}
      <Icon size={16} className="flex-shrink-0" />
      {!collapsed && <span className="truncate leading-none">{label}</span>}
      {collapsed && (
        <div className="absolute left-full ml-3 px-2 py-1 bg-ink text-paper text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
          {label}
        </div>
      )}
    </Link>
  );
}

function SidebarContent({ collapsed, onClose, showClose }: { collapsed: boolean; onClose?: () => void; showClose?: boolean }) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand header */}
      <div className={`flex items-center h-16 border-b border-white/10 flex-shrink-0 ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-signal flex items-center justify-center flex-shrink-0">
                <span className="font-mono font-bold text-white text-xs">Rx</span>
              </div>
              <div className="min-w-0">
                <p className="font-display font-bold text-white text-sm leading-none truncate">{branding.name}</p>
                <p className="text-[10px] text-white/40 font-mono leading-none mt-0.5">Admin Panel</p>
              </div>
            </div>
            {showClose && (
              <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0">
                <X size={15} />
              </button>
            )}
          </>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-signal flex items-center justify-center">
            <span className="font-mono font-bold text-white text-xs">Rx</span>
          </div>
        )}
      </div>

      {/* View storefront link */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-0">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
          >
            <Store size={13} />
            <span>View storefront</span>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5 scrollbar-hide">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[9px] uppercase tracking-[0.12em] font-mono text-white/25 select-none">
                {group.label}
              </p>
            )}
            <div className="space-y-px">
              {group.items.map(({ href, icon, label, exact }) => (
                <NavItem
                  key={href}
                  href={href}
                  icon={icon}
                  label={label}
                  exact={exact}
                  collapsed={collapsed}
                  onClick={onClose}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className={`border-t border-white/10 pt-3 pb-4 flex-shrink-0 ${collapsed ? 'px-1' : 'px-2'}`}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-petrol-300/30 flex items-center justify-center flex-shrink-0">
              <span className="font-mono font-bold text-white text-xs">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white/80 leading-none truncate">Administrator</p>
              <p className="text-[10px] text-white/35 leading-none mt-0.5 truncate">{branding.email}</p>
            </div>
            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-white/35 hover:text-white hover:bg-white/10 transition-colors">
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <button
            title="Log out"
            className="h-9 w-9 rounded-lg flex items-center justify-center mx-auto text-white/35 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

export function AdminSidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`
          hidden md:flex flex-col bg-[#1a2e2b] flex-shrink-0 relative
          transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${collapsed ? 'w-[60px]' : 'w-[232px]'}
        `}
        style={{ minHeight: '100vh' }}
      >
        <SidebarContent collapsed={collapsed} />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-[#1a2e2b] border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-colors shadow-md z-10"
        >
          {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
        </button>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 w-[232px] bg-[#1a2e2b] z-50 md:hidden flex flex-col shadow-2xl"
            >
              <SidebarContent collapsed={false} onClose={onClose} showClose />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
