'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { Menu, Bell, Search, ChevronRight, User } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { branding } from '@/lib/config/branding';
import { api } from '../../../convex/_generated/api';
import { useAdminName } from '@/hooks/useAdminName';
import { useAdminToast } from '@/components/admin/ui/Toast';

function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1108, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

const routeLabels: Record<string, string> = {
  '/admin': 'Home',
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
  '/admin/discounts': 'Discounts',
  '/admin/audit-log': 'Audit Log',
  '/admin/settings': 'Settings',
};

function getTitle(pathname: string): string {
  if (routeLabels[pathname]) return routeLabels[pathname];
  const parent = Object.entries(routeLabels).find(([k]) => pathname.startsWith(k) && k !== '/admin')?.[1];
  return parent ?? 'Admin';
}

export function AdminTopBar({ onMenuClick, onSearchClick }: { onMenuClick: () => void; onSearchClick?: () => void }) {
  const pathname = usePathname();
  const title = getTitle(pathname);
  const isDetail = !routeLabels[pathname] && pathname !== '/admin';
  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);
  const { name: adminName } = useAdminName();
  const { toast } = useAdminToast();
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = useQuery(api.notifications.listNotifications, { limit: 20 });
  const markAsRead = useMutation(api.notifications.markAsRead);
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;
  const lastSeenIdRef = useRef<string | null>(null);
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    if (!notifications || notifications.length === 0) return;
    const latest = notifications[0];
    if (isFirstLoadRef.current) {
      lastSeenIdRef.current = latest._id;
      isFirstLoadRef.current = false;
      return;
    }
    if (latest._id !== lastSeenIdRef.current && !latest.read) {
      lastSeenIdRef.current = latest._id;
      playChime();
      toast(`${latest.title}: ${latest.message}`);
    }
  }, [notifications, toast]);

  const handleOpenNotifications = () => {
    setNotifOpen((v) => !v);
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications?.filter((n) => !n.read).map((n) => n._id) ?? [];
    if (unreadIds.length > 0) await markAsRead({ notificationIds: unreadIds });
  };

  return (
    <header className="h-14 flex-shrink-0 flex items-center gap-3 px-3 sm:px-4 bg-p-bg-inverse">
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        aria-expanded={false}
        aria-controls="admin-sidebar"
        className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-white hover:bg-white/10 transition-colors flex-shrink-0"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-1.5 min-w-0 text-sm shrink-0">
        <span className="text-white/40 hidden sm:inline truncate">{branding.name}</span>
        <ChevronRight size={12} className="text-white/20 hidden sm:block flex-shrink-0" />
        {isDetail && (
          <>
            <span className="text-white/40 truncate hidden sm:inline">{getTitle(pathname.split('/').slice(0, -1).join('/') || '/admin')}</span>
            <ChevronRight size={12} className="text-white/20 flex-shrink-0 hidden sm:block" />
          </>
        )}
        <span className="font-semibold text-white truncate">{title}</span>
      </div>

      <button
        onClick={onSearchClick}
        className="flex-1 max-w-[580px] mx-auto flex items-center gap-2 h-9 px-3.5 text-sm text-white/70 bg-white/12 hover:bg-white/[0.16] rounded-lg transition-colors"
      >
        <Search size={14} />
        <span className="text-xs">Search</span>
        <kbd className="hidden sm:inline text-[10px] bg-white/10 rounded px-1.5 py-0.5 font-mono text-white/50 ml-auto">
          {isMac ? '⌘K' : 'Ctrl K'}
        </kbd>
      </button>

      <div className="flex items-center gap-2 flex-shrink-0 relative">
        <button
          aria-label="Notifications"
          aria-expanded={notifOpen}
          onClick={handleOpenNotifications}
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-white hover:bg-white/10 transition-colors"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-p-critical ring-2 ring-p-bg-inverse" />
          )}
        </button>

        <AnimatePresence>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-[150]" onClick={() => setNotifOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-[340px] bg-p-bg-surface border border-p-border-subdued rounded-xl shadow-p-popover z-[160] overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 h-11 border-b border-p-border-subdued">
                  <p className="text-sm font-semibold text-p-text">Notifications</p>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs text-p-focus hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="admin-scroll max-h-80 overflow-y-auto">
                  {notifications === undefined ? (
                    <p className="text-sm text-p-text-subdued px-4 py-6 text-center">Loading...</p>
                  ) : notifications.length === 0 ? (
                    <p className="text-sm text-p-text-subdued px-4 py-6 text-center">No notifications yet.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`px-4 py-3 border-b border-p-border-subdued last:border-0 ${!n.read ? 'bg-p-bg-surface-selected' : ''}`}
                      >
                        <p className="text-sm font-medium text-p-text">{n.title}</p>
                        <p className="text-[13px] text-p-text-subdued mt-0.5">{n.message}</p>
                        <p className="text-[12px] text-p-text-disabled mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="w-7 h-7 rounded-full bg-p-primary flex items-center justify-center flex-shrink-0" title={adminName}>
          <User size={14} className="text-white" />
        </div>
      </div>
    </header>
  );
}
