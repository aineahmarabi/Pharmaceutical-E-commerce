'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useMutation } from 'convex/react';
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminApi';
import { Menu, Bell, Search, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../../../convex/_generated/api';
import { useAdminName } from '@/hooks/useAdminName';
import { useBranding } from '@/hooks/useBranding';
import { useAdminSession } from '@/hooks/useAdminSession';
import { ROLE_LABELS } from '@/lib/permissions';
import { useAdminToast } from '@/components/admin/ui/Toast';

function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
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

const iconButton =
  'relative w-9 h-9 rounded-lg flex items-center justify-center text-p-text hover:bg-p-bg-surface-hover active:scale-[0.97] transition ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p-focus';

export function AdminTopBar({ onMenuClick, onSearchClick }: { onMenuClick: () => void; onSearchClick?: () => void }) {
  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);
  const pathname = usePathname();
  const { name: adminName, initials } = useAdminName();
  const branding = useBranding();
  const { role } = useAdminSession();
  const { toast } = useAdminToast();
  const [notifOpen, setNotifOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const logoutMutation = useMutation(api.adminAuth.logout);

  const notifications = useAdminQuery(api.notifications.listNotifications, { limit: 20 });
  const markAsRead = useAdminMutation(api.notifications.markAsRead);
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

  // Close menus on navigation and on Escape.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close menus on navigation
    setNotifOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!notifOpen && !accountOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNotifOpen(false);
        setAccountOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [notifOpen, accountOpen]);

  const handleMarkAllRead = async () => {
    const unreadIds = notifications?.filter((n) => !n.read).map((n) => n._id) ?? [];
    if (unreadIds.length > 0) await markAsRead({ notificationIds: unreadIds });
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('adminToken');
    // Tell the route guard this was a deliberate sign-out, so it sends the user to the storefront, not the login page.
    try { sessionStorage.setItem('pc-admin-signed-out', '1'); } catch { /* storage unavailable: falls back to the login page */ }
    if (token) await logoutMutation({ token });
    localStorage.removeItem('adminToken');
    window.location.href = '/';
  };

  return (
    <header className="h-14 flex-shrink-0 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 bg-p-bg-surface border-b border-p-border-subdued">
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        aria-controls="admin-sidebar"
        className={`lg:hidden flex-shrink-0 ${iconButton}`}
      >
        <Menu size={20} />
      </button>

      <p className="hidden md:block text-sm font-semibold text-p-text truncate max-w-[200px] flex-shrink-0">{branding.name}</p>

      <button
        onClick={onSearchClick}
        aria-label="Search or open command palette"
        className="flex-1 max-w-[560px] mx-auto flex items-center gap-2 h-9 px-3 text-sm text-p-text-subdued bg-p-bg border border-p-border-subdued hover:border-p-border rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p-focus"
      >
        <Search size={14} aria-hidden="true" />
        <span className="truncate">Search</span>
        <kbd className="hidden sm:inline ml-auto text-xs text-p-text-subdued bg-p-bg-surface border border-p-border-subdued rounded px-1.5 py-0.5">
          {isMac ? '⌘K' : 'Ctrl K'}
        </kbd>
      </button>

      <div className="flex items-center gap-1 flex-shrink-0 relative">
        <button
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          aria-expanded={notifOpen}
          onClick={() => {
            setNotifOpen((v) => !v);
            setAccountOpen(false);
          }}
          className={iconButton}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-p-critical text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-[150]" onClick={() => setNotifOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-[min(340px,calc(100vw-1.5rem))] bg-p-bg-surface border border-p-border-subdued rounded-xl shadow-p-popover z-[160] overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 h-11 border-b border-p-border-subdued">
                  <p className="text-sm font-semibold text-p-text">Notifications</p>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-sm text-p-text-primary hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p-focus">
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
                        <p className="text-sm text-p-text-subdued mt-0.5">{n.message}</p>
                        <p className="text-xs text-p-text-subdued mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <button
          aria-label="Account menu"
          aria-expanded={accountOpen}
          aria-haspopup="menu"
          onClick={() => {
            setAccountOpen((v) => !v);
            setNotifOpen(false);
          }}
          className="flex items-center gap-1.5 h-9 pl-1 pr-2 rounded-lg hover:bg-p-bg-surface-hover active:scale-[0.97] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p-focus"
        >
          <span className="w-7 h-7 rounded-full bg-p-primary text-white text-xs font-semibold flex items-center justify-center">
            {initials}
          </span>
          <ChevronDown size={14} className="text-p-icon hidden sm:block" />
        </button>

        <AnimatePresence>
          {accountOpen && (
            <>
              <div className="fixed inset-0 z-[150]" onClick={() => setAccountOpen(false)} />
              <motion.div
                role="menu"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-60 bg-p-bg-surface border border-p-border-subdued rounded-xl shadow-p-popover z-[160] overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-p-border-subdued">
                  <p className="text-sm font-semibold text-p-text truncate">{adminName}</p>
                  <p className="text-xs text-p-text-subdued truncate">{role ? ROLE_LABELS[role] : 'Admin'}</p>
                </div>
                <div className="py-1">
                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    className="flex items-center h-9 px-4 text-sm text-p-text hover:bg-p-bg-surface-hover focus-visible:outline-none focus-visible:bg-p-bg-surface-hover"
                  >
                    View storefront
                  </a>
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full flex items-center h-9 px-4 text-sm text-left text-p-text hover:bg-p-bg-surface-hover focus-visible:outline-none focus-visible:bg-p-bg-surface-hover"
                  >
                    Log out
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
