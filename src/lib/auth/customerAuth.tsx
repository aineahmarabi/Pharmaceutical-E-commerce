'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const TOKEN_KEY = 'pharmacare_customer_token';

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
}

interface CustomerAuthContextValue {
  customer: Customer | null | undefined; // undefined = still resolving
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return ctx;
}

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem(TOKEN_KEY));
    setReady(true);
  }, []);

  const customer = useQuery(api.customerAuth.getCurrentCustomer, ready && token ? { token } : 'skip');
  const loginMutation = useMutation(api.customerAuth.login);
  const signupMutation = useMutation(api.customerAuth.signup);
  const logoutMutation = useMutation(api.customerAuth.logout);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginMutation({ email, password });
    if (result.success && result.token) {
      localStorage.setItem(TOKEN_KEY, result.token);
      setToken(result.token);
    }
    return result;
  }, [loginMutation]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const result = await signupMutation({ name, email, password });
    if (result.success && result.token) {
      localStorage.setItem(TOKEN_KEY, result.token);
      setToken(result.token);
    }
    return result;
  }, [signupMutation]);

  const logout = useCallback(() => {
    if (token) logoutMutation({ token }).catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, [token, logoutMutation]);

  const value: CustomerAuthContextValue = {
    customer: !ready || !token ? (ready ? null : undefined) : customer,
    token,
    isAuthenticated: Boolean(token && customer),
    login,
    signup,
    logout,
  };

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}
