import { mutation, query, QueryCtx } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import { clearFailures, lockedForMs, recordFailure, safeEqual, secureToken } from './throttle';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const MAX_SESSIONS_PER_ACCOUNT = 5;
const MAX_LOGIN_FAILURES = 5;

const LIMITS = { name: 100, email: 254, password: 128 };
const MIN_PASSWORD = 8;
const COMMON_PASSWORDS = new Set([
  '12345678', '123456789', '1234567890', 'password', 'password1', 'password123', 'qwertyui', 'qwerty123',
  'iloveyou', '11111111', '00000000', 'abc12345', 'letmein1', 'welcome1', 'admin123', 'pharmacare',
]);

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  return bytes;
}

async function hashPassword(password: string, saltHex?: string): Promise<{ hash: string; salt: string }> {
  const salt = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  return { hash: bytesToHex(new Uint8Array(bits)), salt: bytesToHex(salt) };
}

function passwordProblem(password: string, email: string): string | null {
  if (password.length < MIN_PASSWORD) return `Password must be at least ${MIN_PASSWORD} characters.`;
  if (password.length > LIMITS.password) return `Password must be at most ${LIMITS.password} characters.`;
  if (COMMON_PASSWORDS.has(password.toLowerCase())) return 'That password is too common. Please choose another.';
  const local = email.split('@')[0];
  if (local.length >= 4 && password.toLowerCase().includes(local.toLowerCase())) {
    return 'Password should not contain your email name.';
  }
  if (/^(.)\1+$/.test(password)) return 'Please choose a less repetitive password.';
  return null;
}

async function getCustomerFromToken(ctx: QueryCtx, token: string) {
  const session = await ctx.db
    .query('customerAccountSessions')
    .withIndex('by_token', (q) => q.eq('token', token))
    .first();
  if (!session || session.expiresAt < Date.now()) return null;
  const customer = await ctx.db.get(session.customerAccountId);
  return customer;
}

export const signup = mutation({
  args: { name: v.string(), email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const email = args.email.trim().toLowerCase();

    if (!name) return { success: false, error: 'Please enter your name.' };
    if (name.length > LIMITS.name) return { success: false, error: 'Name is too long.' };
    if (email.length > LIMITS.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    const problem = passwordProblem(args.password, email);
    if (problem) return { success: false, error: problem };

    // Limit repeated sign-up attempts for the same address.
    const key = `signup:${email}`;
    if ((await lockedForMs(ctx, key)) > 0) {
      return { success: false, error: 'Too many attempts. Please try again in a few minutes.' };
    }

    const existing = await ctx.db.query('customerAccounts').withIndex('by_email', (q) => q.eq('email', email)).first();
    if (existing) {
      await recordFailure(ctx, key, 5);
      return { success: false, error: 'An account with this email already exists. Try logging in instead.' };
    }

    const { hash, salt } = await hashPassword(args.password);
    const customerAccountId = await ctx.db.insert('customerAccounts', {
      name,
      email,
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: Date.now(),
    });

    const token = secureToken();
    await ctx.db.insert('customerAccountSessions', {
      customerAccountId,
      token,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_TTL_MS,
    });

    return { success: true, token };
  },
});

export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const generic = { success: false as const, error: 'Invalid email or password.' };

    if (email.length > LIMITS.email || args.password.length > LIMITS.password) return generic;

    const key = `login:${email}`;
    if ((await lockedForMs(ctx, key)) > 0) {
      return { success: false as const, error: 'Too many failed attempts. Please wait a few minutes and try again.' };
    }

    const customer = await ctx.db.query('customerAccounts').withIndex('by_email', (q) => q.eq('email', email)).first();

    // Always do the same amount of hashing work, so response time does not reveal
    // whether the email has an account.
    const { hash } = await hashPassword(args.password, customer?.passwordSalt ?? '00'.repeat(16));
    const ok = customer ? safeEqual(hash, customer.passwordHash) : false;

    if (!customer || !ok) {
      await recordFailure(ctx, key, MAX_LOGIN_FAILURES);
      return generic;
    }

    await clearFailures(ctx, key);

    // Housekeeping: drop expired sessions and cap how many stay active per account.
    const sessions = await ctx.db
      .query('customerAccountSessions')
      .withIndex('by_customer', (q) => q.eq('customerAccountId', customer._id))
      .collect();
    const live = sessions.filter((s) => s.expiresAt >= Date.now()).sort((a, b) => b.createdAt - a.createdAt);
    for (const s of sessions) if (s.expiresAt < Date.now()) await ctx.db.delete(s._id);
    for (const s of live.slice(MAX_SESSIONS_PER_ACCOUNT - 1)) await ctx.db.delete(s._id);

    const token = secureToken();
    await ctx.db.insert('customerAccountSessions', {
      customerAccountId: customer._id,
      token,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_TTL_MS,
    });

    return { success: true as const, token };
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db.query('customerAccountSessions').withIndex('by_token', (q) => q.eq('token', args.token)).first();
    if (session) await ctx.db.delete(session._id);
    return { success: true };
  },
});

export const getCurrentCustomer = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const customer = await getCustomerFromToken(ctx, args.token);
    if (!customer) return null;
    return {
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone ?? '',
      dob: customer.dob ?? '',
    };
  },
});

export const updateProfile = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    dob: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.query('customerAccountSessions').withIndex('by_token', (q) => q.eq('token', args.token)).first();
    if (!session || session.expiresAt < Date.now()) return { success: false, error: 'Session expired. Please log in again.' };

    const name = args.name.trim();
    if (!name) return { success: false, error: 'Please enter your name.' };
    if (name.length > LIMITS.name) return { success: false, error: 'Name is too long.' };

    await ctx.db.patch(session.customerAccountId, {
      name,
      phone: args.phone?.trim().slice(0, 30) || undefined,
      dob: args.dob?.trim().slice(0, 20) || undefined,
    });

    return { success: true };
  },
});

export async function requireCustomerId(ctx: QueryCtx, token: string): Promise<Id<'customerAccounts'>> {
  const session = await ctx.db.query('customerAccountSessions').withIndex('by_token', (q) => q.eq('token', token)).first();
  if (!session || session.expiresAt < Date.now()) throw new Error('Session expired. Please log in again.');
  return session.customerAccountId;
}
