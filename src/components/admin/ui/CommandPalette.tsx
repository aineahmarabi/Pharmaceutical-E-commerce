'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useAdminSession } from '@/hooks/useAdminSession';
import { useAdminQuery } from '@/hooks/useAdminApi';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { api } from '../../../../convex/_generated/api';

interface ResultItem {
  key: string;
  label: string;
  type: string;
  href: string;
  shortcut?: string;
}

const ACTIONS: ResultItem[] = [
  { key: 'action-add-product', label: 'Add product', type: 'Action', href: '/admin/products/new' },
  { key: 'action-create-order', label: 'Create order', type: 'Action', href: '/admin/orders/new' },
  { key: 'action-create-discount', label: 'Create discount', type: 'Action', href: '/admin/discounts/new' },
];

const PAGES: ResultItem[] = [
  { key: 'nav-home', label: 'Home', type: 'Page', href: '/admin' },
  { key: 'nav-orders', label: 'Orders', type: 'Page', href: '/admin/orders' },
  { key: 'nav-prescriptions', label: 'Prescriptions', type: 'Page', href: '/admin/prescriptions' },
  { key: 'nav-products', label: 'Products', type: 'Page', href: '/admin/products' },
  { key: 'nav-customers', label: 'Customers', type: 'Page', href: '/admin/customers' },
  { key: 'nav-analytics', label: 'Analytics', type: 'Page', href: '/admin/analytics' },
  { key: 'nav-discounts', label: 'Discounts', type: 'Page', href: '/admin/discounts' },
  { key: 'nav-inventory', label: 'Inventory', type: 'Page', href: '/admin/inventory' },
  { key: 'nav-categories', label: 'Categories', type: 'Page', href: '/admin/categories' },
  { key: 'nav-brands', label: 'Brands', type: 'Page', href: '/admin/brands' },
  { key: 'nav-conditions', label: 'Conditions', type: 'Page', href: '/admin/conditions' },
  { key: 'nav-messages', label: 'Messages', type: 'Page', href: '/admin/messages' },
  { key: 'nav-newsletter', label: 'Newsletter', type: 'Page', href: '/admin/newsletter' },
  { key: 'nav-pos', label: 'POS Terminal', type: 'Page', href: '/admin/pos' },
  { key: 'nav-staff', label: 'Staff', type: 'Page', href: '/admin/staff' },
  { key: 'nav-settings', label: 'Settings', type: 'Page', href: '/admin/settings' },
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

  const products = useAdminQuery(api.adminProducts.adminListProducts, query.length > 1 ? { limit: 5, search: query } : 'skip');
  const orders = useAdminQuery(api.orders.listOrders, query.length > 1 ? { limit: 5, search: query } : 'skip');
  const { role } = useAdminSession();
  const customers = useAdminQuery(api.customers.listCustomers, query.length > 1 && (role === 'super_admin' || role === 'admin') ? { search: query } : 'skip');

  useEffect(() => {
    if (open) {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset palette state when opened
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
          ? [{ label: 'Recently visited', items: recents.map((r) => ({ key: `recent-${r.href}`, label: r.label, type: 'Page', href: r.href })) }]
          : []),
      ];
    }

    const navMatches = PAGES.filter((p) => p.label.toLowerCase().includes(query.toLowerCase()));
    const productMatches: ResultItem[] = (products ?? []).map((p) => ({
      key: `product-${p._id}`,
      label: p.name,
      type: 'Product',
      href: `/admin/products/${p._id}/edit`,
    }));
    const orderMatches: ResultItem[] = (orders ?? []).map((o) => ({
      key: `order-${o._id}`,
      label: o.orderNumber,
      type: 'Order',
      href: `/admin/orders/${o._id}`,
    }));
    const customerMatches: ResultItem[] = (customers ?? []).map((c) => ({
      key: `customer-${c.id}`,
      label: c.name || c.email || c.phone || "",
      type: 'Customer',
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
        <div className="fixed inset-0 z-[400] flex justify-center px-4 pt-[12vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            className="relative bg-p-bg-surface rounded-xl shadow-p-modal w-full max-w-[640px] h-fit max-h-[70vh] flex flex-col overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <div className="flex items-center gap-3 px-4 h-14 flex-shrink-0">
              <Search size={16} className="text-p-icon flex-shrink-0" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
                placeholder="Search orders, products, customers, or jump to a page"
                aria-label="Search"
                role="combobox"
                aria-expanded="true"
                aria-controls="admin-palette-list"
                aria-activedescendant={flatItems[activeIndex] ? `palette-${flatItems[activeIndex].key}` : undefined}
                className="flex-1 min-w-0 text-base text-p-text placeholder:text-p-text-subdued outline-none bg-transparent"
              />
              <kbd className="hidden sm:inline text-xs text-p-text-subdued border border-p-border-subdued rounded px-1.5 py-0.5">Esc</kbd>
            </div>
            <div id="admin-palette-list" role="listbox" className="admin-scroll border-t border-p-border-subdued overflow-y-auto max-h-[400px] py-1">
              {flatItems.length === 0 && (
                <p className="text-sm text-p-text-subdued px-5 py-8 text-center">
                  {query ? 'No results found.' : 'Type to search.'}
                </p>
              )}
              {groups.map((group) => (
                <div key={group.label} role="group" aria-label={group.label}>
                  <p className="text-xs font-semibold text-p-text-subdued px-4 pt-3 pb-1">{group.label}</p>
                  {group.items.map((item) => {
                    runningIndex += 1;
                    const idx = runningIndex;
                    const active = idx === activeIndex;
                    return (
                      <button
                        key={item.key}
                        id={`palette-${item.key}`}
                        role="option"
                        aria-selected={active}
                        ref={active ? (el) => el?.scrollIntoView({ block: 'nearest' }) : undefined}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => select(item)}
                        className={`w-full flex items-center gap-3 h-10 px-4 text-left transition-colors ${active ? 'bg-p-bg-surface-selected shadow-[inset_3px_0_0_var(--color-p-primary)]' : ''}`}
                      >
                        <span className="text-sm text-p-text flex-1 truncate">{item.label}</span>
                        <span className="text-xs text-p-text-subdued">{item.type}</span>
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
