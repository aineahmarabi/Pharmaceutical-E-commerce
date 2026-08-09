'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/Sidebar';
import { AdminTopBar } from '@/components/admin/TopBar';
import AuthGuard from '@/components/admin/AuthGuard';
import { AdminToastProvider } from '@/components/admin/ui/Toast';
import { ConfirmProvider } from '@/components/admin/ui/ConfirmDialog';
import { CommandPalette } from '@/components/admin/ui/CommandPalette';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // If on login page, don't show sidebar/topbar
  if (pathname === '/admin/login') {
    return <AuthGuard>{children}</AuthGuard>;
  }

  return (
    <AuthGuard>
      <AdminToastProvider>
        <ConfirmProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[999] focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:shadow-p-modal"
          >
            Skip to content
          </a>
          <div className="flex h-screen bg-p-bg overflow-hidden font-p-sans text-[14px] leading-[20px]">
            <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <AdminTopBar onMenuClick={() => setMobileOpen(true)} onSearchClick={() => setPaletteOpen(true)} />
              <main id="main-content" className="flex-1 overflow-y-auto admin-scroll">
                <div className="page-enter px-4 sm:px-8">{children}</div>
              </main>
            </div>
          </div>
          <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
        </ConfirmProvider>
      </AdminToastProvider>
    </AuthGuard>
  );
}
