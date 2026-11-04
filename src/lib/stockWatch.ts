import { useSyncExternalStore } from 'react';

/** Sold-out products this device asked to hear about. Guests rely on this; signed-in customers also have it on their account. */
const KEY = 'pc-stock-watch';
const MAX = 30;
const EMPTY: string[] = [];
const listeners = new Set<() => void>();
let cache: string[] | null = null;

function load(): string[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    cache = Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    cache = [];
  }
  return cache;
}

function save(next: string[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private browsing: the request still works for this visit, it just is not remembered.
  }
  listeners.forEach((l) => l());
}

export function watchOnDevice(productId: string) {
  if (!load().includes(productId)) save([productId, ...load()].slice(0, MAX));
}

export function unwatchOnDevice(productId: string) {
  if (load().includes(productId)) save(load().filter((id) => id !== productId));
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useDeviceWatchIds(): string[] {
  return useSyncExternalStore(subscribe, load, () => EMPTY);
}
