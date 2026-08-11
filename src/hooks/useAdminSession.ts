'use client';

import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { StaffRole } from '@/lib/permissions';

export function useAdminSession() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem('adminToken') || '');
  }, []);

  const info = useQuery(api.adminAuth.getSessionInfo, token ? { token } : 'skip');

  return {
    role: (info?.role ?? null) as StaffRole | null,
    name: info?.name ?? null,
    loading: token === null || (token !== '' && info === undefined),
  };
}
