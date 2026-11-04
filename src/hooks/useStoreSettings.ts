import { useEffect, useSyncExternalStore } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export type StoreSetting = { key: string; value: unknown };

const CACHE_KEY = 'pharmacare-store-settings';
const listeners = new Set<() => void>();
let cached: StoreSetting[] | null | undefined; // undefined = not read yet

function read(): StoreSetting[] | null {
  if (cached !== undefined) return cached;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    cached = raw ? (JSON.parse(raw) as StoreSetting[]) : null;
  } catch {
    cached = null;
  }
  return cached;
}

function write(next: StoreSetting[]) {
  cached = next;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(next));
  } catch {
    // Private browsing: the live query still works, only the instant first paint is lost.
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/**
 * Store settings (name, logo, phone...). The last values seen are kept on this device, so a refresh paints the real
 * branding straight away instead of showing defaults until the live query answers. Returns null while genuinely unknown
 * (first ever visit, and during server render, so server and client markup agree).
 */
export function useStoreSettings(): StoreSetting[] | null {
  const live = useQuery(api.settings.getStoreSettings);
  useEffect(() => {
    if (Array.isArray(live) && JSON.stringify(live) !== JSON.stringify(read())) write(live as StoreSetting[]);
  }, [live]);
  const saved = useSyncExternalStore(subscribe, read, () => null);
  return Array.isArray(live) ? (live as StoreSetting[]) : saved;
}
