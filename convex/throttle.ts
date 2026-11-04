import type { MutationCtx } from './_generated/server';

/**
 * Small failed-attempt limiter used by every login path.
 *
 * After `max` failures inside the window the key is locked for LOCK_MS. The same
 * generic error is shown whether or not an account exists, so the limiter cannot be
 * used to discover accounts. Note: Convex mutations do not see the caller's IP, so
 * keys are per account (or per login surface) rather than per address.
 */
export const THROTTLE_WINDOW_MS = 15 * 60 * 1000;
export const THROTTLE_LOCK_MS = 15 * 60 * 1000;

export async function lockedForMs(ctx: MutationCtx, key: string): Promise<number> {
  const row = await ctx.db.query('authThrottle').withIndex('by_key', (q) => q.eq('key', key)).first();
  if (!row?.lockedUntil) return 0;
  return Math.max(0, row.lockedUntil - Date.now());
}

export async function recordFailure(ctx: MutationCtx, key: string, max: number): Promise<void> {
  const now = Date.now();
  const row = await ctx.db.query('authThrottle').withIndex('by_key', (q) => q.eq('key', key)).first();
  if (!row) {
    await ctx.db.insert('authThrottle', { key, failures: 1, windowStart: now });
    return;
  }
  const expired = now - row.windowStart > THROTTLE_WINDOW_MS && !(row.lockedUntil && row.lockedUntil > now);
  const failures = expired ? 1 : row.failures + 1;
  await ctx.db.patch(row._id, {
    failures,
    windowStart: expired ? now : row.windowStart,
    lockedUntil: failures >= max ? now + THROTTLE_LOCK_MS : undefined,
  });
}

export async function clearFailures(ctx: MutationCtx, key: string): Promise<void> {
  const row = await ctx.db.query('authThrottle').withIndex('by_key', (q) => q.eq('key', key)).first();
  if (row) await ctx.db.delete(row._id);
}

/** Constant-time string comparison (avoids leaking how many leading characters matched). */
export function safeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

/** Unpredictable session token (192 bits from the platform CSPRNG). */
export function secureToken(bytes = 24): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
