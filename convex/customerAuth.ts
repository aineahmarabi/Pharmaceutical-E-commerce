import { mutation, query, QueryCtx } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

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

function generateToken(): string {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(24)));
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
    if (!/^\S+@\S+\.\S+$/.test(email)) return { success: false, error: 'Please enter a valid email address.' };
    if (args.password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };

    const existing = await ctx.db.query('customerAccounts').withIndex('by_email', (q) => q.eq('email', email)).first();
    if (existing) return { success: false, error: 'An account with this email already exists.' };

    const { hash, salt } = await hashPassword(args.password);
    const customerAccountId = await ctx.db.insert('customerAccounts', {
      name,
      email,
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: Date.now(),
    });

    const token = generateToken();
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
    const customer = await ctx.db.query('customerAccounts').withIndex('by_email', (q) => q.eq('email', email)).first();
    if (!customer) return { success: false, error: 'Invalid email or password.' };

    const { hash } = await hashPassword(args.password, customer.passwordSalt);
    if (hash !== customer.passwordHash) return { success: false, error: 'Invalid email or password.' };

    const token = generateToken();
    await ctx.db.insert('customerAccountSessions', {
      customerAccountId: customer._id,
      token,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_TTL_MS,
    });

    return { success: true, token };
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

    await ctx.db.patch(session.customerAccountId, {
      name,
      phone: args.phone?.trim() || undefined,
      dob: args.dob?.trim() || undefined,
    });

    return { success: true };
  },
});

export async function requireCustomerId(ctx: QueryCtx, token: string): Promise<Id<'customerAccounts'>> {
  const session = await ctx.db.query('customerAccountSessions').withIndex('by_token', (q) => q.eq('token', token)).first();
  if (!session || session.expiresAt < Date.now()) throw new Error('Session expired. Please log in again.');
  return session.customerAccountId;
}
