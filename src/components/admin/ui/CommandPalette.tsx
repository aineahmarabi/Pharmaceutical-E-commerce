'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, ShoppingCart, Users, Plus, FileText } from 'lucide-react';
import { api } from '../../../../convex/_generated/api';

interface ResultItem {
  key: string;
  label: string;
  type: string;
  icon: React.ElementType;
  href: string;
  shortcut?: string;
}

const ACTIONS: ResultItem[] = [
  { key: 'action-add-product', label: 'Add product', type: 'Action', icon: Plus, href: '/admin/products/new' },
  { key: 'action-create-order', label: 'Create order', type: 'Action', icon: Plus, href: '/admin/orders/new' },
  { key: 'action-create-discount', label: 'Create discount', type: 'Action', icon: Plus, href: '/admin/discounts/new' },
];

const PAGES: ResultItem[] = [
  { key: 'nav-home', label: 'Home', type: 'Page', icon: FileText, href: '/admin' },
  { key: 'nav-orders', label: 'Orders', type: 'Page', icon: ShoppingCart, href: '/admin/orders' },
  { key: 'nav-products', label: 'Products', type: 'Page', icon: Package, href: '/admin/products' },
  { key: 'nav-customers', label: 'Customers', type: 'Page', icon: Users, href: '/admin/customers' },
  { key: 'nav-analytics', label: 'Analytics', type: 'Page', icon: FileText, href: '/admin/analytics' },
  { key: 'nav-discounts', label: 'Discounts', type: 'Page', icon: FileText, href: '/admin/discounts' },
  { key: 'nav-settings', label: 'Settings', type: 'Page', icon: FileText, href: '/admin/settings' },
];

const RECENTS_KEY = 'admin_recent_routes';

export function pushRecentRoute(href: string, label: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    const list: { href: string; label: string }[] = raw ? JSON.parse(raw) : [];
    const next = [{ href, label }, ...list.filter((r) => r.href !== href)].slice(0, 3);
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {}
}

function getRecents(): { href: string; label: string }[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const products = useQuery(api.adminProducts.adminListProducts, query.length > 1 ? { limit: 5, search: query } : 'skip');
  const orders = useQuery(api.orders.listOrders, query.length > 1 ? { limit: 5, search: query } : 'skip');
  const customers = useQuery(api.customers.listCustomers, query.length > 1 ? { search: query } : 'skip');

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const groups = useMemo(() => {
    if (!query) {
      const recents = getRecents();
      return [
        { label: 'Actions', items: ACTIONS },
        ...(recents.length > 0
          ? [{ label: 'Recently visited', items: recents.map((r) => ({ key: `recent-${r.href}`, label: r.label, type: 'Page', icon: FileText, href: r.href })) }]
          : []),
      ];
    }

    const navMatches = PAGES.filter((p) => p.label.toLowerCase().includes(query.toLowerCase()));
    const productMatches: ResultItem[] = (products ?? []).map((p: any) => ({
      key: `product-${p._id}`,
      label: p.name,
      type: 'Product',
      icon: Package,
      href: `/admin/products/${p._id}/edit`,
    }));
    const orderMatches: ResultItem[] = (orders ?? []).map((o: any) => ({
      key: `order-${o._id}`,
      label: o.orderNumber,
      type: 'Order',
      icon: ShoppingCart,
      href: `/admin/orders/${o._id}`,
    }));
    const customerMatches: ResultItem[] = (customers ?? []).map((c: any) => ({
      key: `customer-${c.id}`,
      label: c.name || c.email || c.phone,
      type: 'Customer',
      icon: Users,
      href: `/admin/customers/${encodeURIComponent(c.id)}`,
    }));

    return [
      ...(navMatches.length ? [{ label: 'Navigation', items: navMatches }] : []),
      ...(productMatches.length ? [{ label: 'Products', items: productMatches }] : []),
      ...(orderMatches.length ? [{ label: 'Orders', items: orderMatches }] : []),
      ...(customerMatches.length ? [{ label: 'Customers', items: customerMatches }] : []),
    ];
  }, [query, products, orders, customers]);

  const flatItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  const select = (item: ResultItem) => {
    pushRecentRoute(item.href, item.label);
    router.push(item.href);
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = flatItems[activeIndex];
        if (item) select(item);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, flatItems, activeIndex, onClose]);

  if (typeof document === 'undefined') return null;

  let runningIndex = -1;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[400] flex justify-center px-4" style={{ paddingTop: '20vh' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative bg-p-bg-surface rounded-xl shadow-p-modal w-full max-w-[640px] h-fit max-h-[70vh] flex flex-col overflow-hidden"
            role="combobox"
            aria-expanded={open}
          >
            <div className="flex items-center gap-3 px-5 h-14 flex-shrink-0">
              <Search size={18} className="text-p-icon-subdued flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
                placeholder="Search or jump to..."
                className="flex-1 min-w-0 text-base outline-none bg-transparent"
              />
            </div>
            <div role="listbox" className="border-t border-p-border-subdued overflow-y-auto max-h-[400px]">
              {flatItems.length === 0 && (
                <p className="text-sm text-p-text-subdued px-5 py-6 text-center">No results found.</p>
              )}
              {groups.map((group) => (
                <div key={group.label}>
                  <p className="text-[12px] uppercase tracking-wide font-semibold text-p-text-subdued px-5 pt-2 pb-1">{group.label}</p>
                  {group.items.map((item) => {
                    runningIndex += 1;
                    const idx = runningIndex;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.key}
                        role="option"
                        aria-selected={idx === activeIndex}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => select(item)}
                        className={`w-full flex items-center gap-3 h-11 px-5 text-left transition-colors ${idx === activeIndex ? 'bg-p-bg' : ''}`}
                      >
                        <Icon size={18} className="text-p-icon flex-shrink-0" />
                        <span className="text-sm text-p-text flex-1 truncate">{item.label}</span>
                        <span className="text-[12px] text-p-text-subdued">{item.type}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
