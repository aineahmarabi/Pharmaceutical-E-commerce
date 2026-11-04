"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { canAccessRoute, ROLE_LANDING_PATH } from '@/lib/permissions';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // We read the token on the client
  useEffect(() => {
    const t = localStorage.getItem('adminToken');
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read localStorage after mount to avoid hydration mismatch
    setToken(t || '');
  }, []);

  const isValid = useQuery(api.adminAuth.validateSession, token ? { token } : "skip");
  const sessionInfo = useQuery(api.adminAuth.getSessionInfo, token ? { token } : "skip");

  useEffect(() => {
    // If the query returns false, or if we have no token at all, redirect to login
    if ((isValid === false || token === '') && pathname !== '/admin/login') {
      let signedOut = false;
      try {
        signedOut = sessionStorage.getItem('pc-admin-signed-out') === '1';
        sessionStorage.removeItem('pc-admin-signed-out');
      } catch { /* storage unavailable */ }
      // A deliberate sign-out goes to the storefront; an expired or missing session goes to the login page.
      router.push(signedOut ? '/' : '/admin/login');
    }
  }, [isValid, token, pathname, router]);

  useEffect(() => {
    if (!sessionInfo || pathname === '/admin/login') return;
    if (!canAccessRoute(sessionInfo.role, pathname)) {
      router.replace(ROLE_LANDING_PATH[sessionInfo.role]);
    }
  }, [sessionInfo, pathname, router]);

  // If token hasn't loaded from localStorage yet
  if (token === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-p-bg" role="status" aria-label="Loading">
        <div className="animate-spin motion-reduce:animate-none rounded-full h-8 w-8 border-2 border-p-border-subdued border-t-p-primary"></div>
      </div>
    );
  }

  // If on the login page, just render the login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // If we have a token but convex is still loading
  if (token !== '' && isValid === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-p-bg" role="status" aria-label="Loading">
        <div className="animate-spin motion-reduce:animate-none rounded-full h-8 w-8 border-2 border-p-border-subdued border-t-p-primary"></div>
      </div>
    );
  }

  // If valid, render children
  if (isValid === true) {
    return <>{children}</>;
  }

  return null;
}
