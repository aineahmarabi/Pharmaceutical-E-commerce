"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // We read the token on the client
  useEffect(() => {
    const t = localStorage.getItem('adminToken');
    setToken(t || '');
  }, []);

  const isValid = useQuery(api.adminAuth.validateSession, token ? { token } : "skip");

  useEffect(() => {
    // If the query returns false, or if we have no token at all, redirect to login
    if ((isValid === false || token === '') && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [isValid, token, pathname, router]);

  // If token hasn't loaded from localStorage yet
  if (token === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-petrol"></div>
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-petrol"></div>
      </div>
    );
  }

  // If valid, render children
  if (isValid === true) {
    return <>{children}</>;
  }

  return null;
}
