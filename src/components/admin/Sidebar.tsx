'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, ShoppingCart, Package, Users, BarChart3, Percent, Monitor,
  Settings, ChevronRight, ChevronDown, Boxes, Activity, UserCircle,
  Store, LogOut, X, Pill, Mail, Send,
} from 'lucide-react';
import { branding } from '@/lib/config/branding';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAdminName } from '@/hooks/useAdminName';
import { useBranding } from '@/hooks/useBranding';
import { useAdminSession } from '@/hooks/useAdminSession';
import { canAccessRoute, ROLE_LABELS } from '@/lib/permissions';
import { BrandName } from '@/components/ui/BrandName';

interface NavLeaf {
  href: string;
  icon: React.ElementType;
  label: string;
  exact?: boolean;
  badge?: number;
}

const mainNav: NavLeaf[] = [
  { href: '/admin', icon: Home, label: 'Home', exact: true },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/admin/products', icon: Package, label: 'Products' },
];

const productsChildNav: NavLeaf = { href: '/admin/inventory', icon: Boxes, label: 'Inventory' };

const mainNavAfterProducts: NavLeaf[] = [
  { href: '/admin/customers', icon: Users, label: 'Customers' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/admin/discounts', icon: Percent, label: 'Discounts' },
  { href: '/admin/messages', icon: Mail, label: 'Messages' },
  { href: '/admin/newsletter', icon: Send, label: 'Newsletter' },
];

const catalogNav: NavLeaf[] = [
  { href: '/admin/categories', icon: Boxes, label: 'Categories' },
  { href: '/admin/conditions', icon: Activity, label: 'Conditions' },
  { href: '/admin/brands', icon: Boxes, label: 'Brands' },
  { href: '/admin/pos', icon: Monitor, label: 'POS Terminal' },
  { href: '/admin/staff', icon: UserCircle, label: 'Staff' },
];

const settingsNav: NavLeaf = { href: '/admin/settings', icon: Settings, label: 'Settings' };

function NavItem({ item, collapsed, onClick, indent = false }: { item: NavLeaf; collapsed: boolean; onClick?: () => void; indent?: boolean }) {
  const pathname = usePathname();
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? item.label : undefined}
      className={`
        relative flex items-center gap-2 rounded-lg text-sm font-medium transition-colors duration-150 group
        focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--color-p-focus)]
        ${collapsed ? 'h-9 w-9 justify-center mx-auto' : indent ? 'h-8 pl-6 pr-3 w-full' : 'h-8 px-3 w-full'}
        ${active ? 'bg-white/8 text-white' : 'text-[#D4D6D8] hover:bg-white/6'}
      `}
    >
      <Icon size={indent ? 16 : 20} className={`flex-shrink-0 ${active ? 'text-white' : 'text-[#A6ACB2]'}`} />
      {!collapsed && <span className="truncate leading-none">{item.label}</span>}
      {!collapsed && item.badge !== undefined && (
        <span className="ml-auto bg-p-primary-hover text-white rounded-[10px] px-2 py-0.5 text-xs font-semibold">
          {item.badge}
        </span>
      )}
      {collapsed && (
        <div className="absolute left-full ml-3 px-2 py-1 bg-p-bg-inverse text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-p-popover">
          {item.label}
        </div>
      )}
    </Link>
  );
}

function SidebarContent({ collapsed, onClose, showClose }: { collapsed: boolean; onClose?: () => void; showClose?: boolean }) {
  const router = useRouter();
  const dynamicBranding = useBranding();
  const [catalogOpen, setCatalogOpen] = useState(false);
  const logoutMutation = useMutation(api.adminAuth.logout);
  const { name: adminName, initials: adminInitials } = useAdminName();
  const { role } = useAdminSession();
  const visible = (href: string) => role !== null && canAccessRoute(role, href);
  const visibleMainNav = mainNav.filter((i) => visible(i.href));
  const visibleMainNavAfterProducts = mainNavAfterProducts.filter((i) => visible(i.href));
  const visibleCatalogNav = catalogNav.filter((i) => visible(i.href));
  const orders = useQuery(api.orders.listOrders, { limit: 200 });
  const pendingOrderCount = orders?.filter((o) => o.status === 'placed' || o.status === 'confirmed').length;
  const messages = useQuery(api.messages.listMessages);
  const unreadMessageCount = messages?.filter((m) => !m.read).length;

  const handleLogout = async () => {
    const token = localStorage.getItem('adminToken');
    if (token) await logoutMutation({ token });
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`flex items-center h-14 border-b border-white/10 flex-shrink-0 ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-p-primary flex items-center justify-center flex-shrink-0 overflow-hidden">
                {dynamicBranding.logo ? (
                  <img src={dynamicBranding.logo} alt={dynamicBranding.name} className="w-full h-full object-cover" />
                ) : (
                  <Pill size={16} className="text-white" strokeWidth={2.5} />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-display font-bold text-white text-sm leading-none truncate">
                  <BrandName name={branding.name} accentClassName="text-[#5EEAD4]" />
                </p>
                <p className="text-[10px] text-white/40 font-mono leading-none mt-0.5">{role ? ROLE_LABELS[role] : 'Admin'}</p>
              </div>
            </div>
            {showClose && (
              <button onClick={onClose} aria-label="Close menu" className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0">
                <X size={15} />
              </button>
            )}
          </>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-p-primary flex items-center justify-center overflow-hidden">
            {dynamicBranding.logo ? (
              <img src={dynamicBranding.logo} alt={dynamicBranding.name} className="w-full h-full object-cover" />
            ) : (
              <Pill size={16} className="text-white" strokeWidth={2.5} />
            )}
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="px-3 pt-3">
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

      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto overscroll-contain py-3 px-2 space-y-1 scrollbar-hide">
        {visibleMainNav.map((item) => (
          <NavItem
            key={item.href}
            item={item.href === '/admin/orders' && pendingOrderCount ? { ...item, badge: pendingOrderCount } : item}
            collapsed={collapsed}
            onClick={onClose}
          />
        ))}
        {visible(productsChildNav.href) && <NavItem item={productsChildNav} collapsed={collapsed} onClick={onClose} indent />}
        {visibleMainNavAfterProducts.map((item) => (
          <NavItem
            key={item.href}
            item={item.href === '/admin/messages' && unreadMessageCount ? { ...item, badge: unreadMessageCount } : item}
            collapsed={collapsed}
            onClick={onClose}
          />
        ))}

        {visibleCatalogNav.length > 0 && (
          <div className="pt-1">
            <button
              onClick={() => setCatalogOpen((v) => !v)}
              className={`flex items-center gap-2 rounded-lg text-sm font-medium transition-colors duration-150 text-[#D4D6D8] hover:bg-white/6
                ${collapsed ? 'h-9 w-9 justify-center mx-auto' : 'h-8 px-3 w-full'}`}
              title={collapsed ? 'Catalogue & Operations' : undefined}
            >
              <Monitor size={20} className="flex-shrink-0 text-[#A6ACB2]" />
              {!collapsed && <span className="truncate leading-none flex-1 text-left">Catalogue &amp; Ops</span>}
              {!collapsed && (
                <motion.span animate={{ rotate: catalogOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronRight size={14} />
                </motion.span>
              )}
            </button>
            <AnimatePresence initial={false}>
              {catalogOpen && !collapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden pl-5 space-y-1 mt-1"
                >
                  {visibleCatalogNav.map((item) => (
                    <NavItem key={item.href} item={item} collapsed={false} onClick={onClose} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {visible(settingsNav.href) && (
          <div className="pt-1">
            <NavItem item={settingsNav} collapsed={collapsed} onClick={onClose} />
          </div>
        )}
      </nav>

      <div className={`border-t border-white/10 pt-3 pb-4 flex-shrink-0 ${collapsed ? 'px-1' : 'px-2'}`}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-p-primary flex items-center justify-center flex-shrink-0">
              <span className="font-mono font-bold text-white text-xs">{adminInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white/80 leading-none truncate">{adminName}</p>
              <p className="text-[10px] text-white/35 leading-none mt-0.5 truncate">{branding.email}</p>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Log out"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/35 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <button
            title="Log out"
            onClick={handleLogout}
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
      <aside
        className={`
          hidden md:flex flex-col bg-p-bg-inverse flex-shrink-0 relative
          transition-[width] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${collapsed ? 'w-14' : 'w-60'}
        `}
        style={{ minHeight: '100vh' }}
      >
        <SidebarContent collapsed={collapsed} />
        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-[68px] w-6 h-6 rounded-full bg-p-bg-inverse border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-colors shadow-p-popover z-10"
        >
          {collapsed ? <ChevronRight size={11} /> : <ChevronRight size={11} className="rotate-180" />}
        </button>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] md:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 w-[280px] bg-p-bg-inverse z-[300] md:hidden flex flex-col shadow-p-modal"
            >
              <SidebarContent collapsed={false} onClose={onClose} showClose />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
