'use client';

import { useCallback, useEffect, useState } from 'react';
import { useConvex, useMutation, useQuery } from 'convex/react';
import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server';

/**
 * Admin-side Convex helpers. Protected admin functions require a `token` argument
 * (the admin session token). These hooks add it automatically so screens do not
 * have to, and they only accept functions that actually require a token, so using
 * one on an unprotected function is a compile error.
 */
const TOKEN_KEY = 'adminToken';

type TokenQuery = FunctionReference<'query', 'public', { token: string }>;
type TokenMutation = FunctionReference<'mutation', 'public', { token: string }>;
type WithoutToken<F extends FunctionReference<'query' | 'mutation'>> = Omit<FunctionArgs<F>, 'token'>;

function readToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? '';
  } catch {
    return '';
  }
}

/** The current admin session token ('' = signed out, null = not read yet). */
export function useAdminToken(): string | null {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read localStorage after mount to avoid hydration mismatch
    setToken(readToken());
  }, []);
  return token;
}

/** Like useQuery for a protected admin function; the token is added for you. */
export function useAdminQuery<F extends TokenQuery>(
  fn: F,
  args: WithoutToken<F> | 'skip',
): FunctionReturnType<F> | undefined {
  const token = useAdminToken();
  const skip = args === 'skip' || !token;
  return useQuery(fn, (skip ? 'skip' : { ...(args as object), token }) as never);
}

/** Like useMutation for a protected admin function; returns a plain async function. */
export function useAdminMutation<F extends TokenMutation>(fn: F) {
  const run = useMutation(fn);
  return useCallback(
    (args: WithoutToken<F>): Promise<FunctionReturnType<F>> => {
      const token = readToken();
      if (!token) return Promise.reject(new Error('Not signed in.'));
      return run({ ...(args as object), token } as never) as Promise<FunctionReturnType<F>>;
    },
    [run],
  );
}

/** One-off calls (event handlers, scanners) to protected functions. */
export function useAdminConvex() {
  const convex = useConvex();
  const query = useCallback(
    <F extends TokenQuery>(fn: F, args: WithoutToken<F>): Promise<FunctionReturnType<F>> => {
      const token = readToken();
      if (!token) return Promise.reject(new Error('Not signed in.'));
      return convex.query(fn, { ...(args as object), token } as never) as Promise<FunctionReturnType<F>>;
    },
    [convex],
  );
  const mutation = useCallback(
    <F extends TokenMutation>(fn: F, args: WithoutToken<F>): Promise<FunctionReturnType<F>> => {
      const token = readToken();
      if (!token) return Promise.reject(new Error('Not signed in.'));
      return convex.mutation(fn, { ...(args as object), token } as never) as Promise<FunctionReturnType<F>>;
    },
    [convex],
  );
  return { query, mutation };
}
