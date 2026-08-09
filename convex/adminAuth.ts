import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

const DEFAULT_PASSCODE = '14328';

async function hashPasscode(passcode: string): Promise<string> {
  const data = new TextEncoder().encode(passcode);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const validateSession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('adminSessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();

    if (!session) return false;
    if (session.expiresAt < Date.now()) {
      return false;
    }
    return true;
  },
});

export const login = mutation({
  args: { passcode: v.string() },
  handler: async (ctx, args) => {
    const security = await ctx.db.query('adminSecurity').first();
    const inputHash = await hashPasscode(args.passcode);

    const isValid = security
      ? security.passcodeHash === inputHash
      : args.passcode === DEFAULT_PASSCODE;

    if (!isValid) {
      if (security) {
        await ctx.db.patch(security._id, {
          failedAttempts: security.failedAttempts + 1,
          lastFailedAt: Date.now(),
        });
      }
      return { success: false, error: 'Invalid passcode' };
    }

    // First successful login with the default passcode seeds the security row
    // so changePasscode has something real to update going forward.
    if (!security) {
      await ctx.db.insert('adminSecurity', {
        passcodeHash: await hashPasscode(DEFAULT_PASSCODE),
        failedAttempts: 0,
        updatedAt: Date.now(),
      });
    }

    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

    await ctx.db.insert('adminSessions', {
      token,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    return { success: true, token };
  },
});

export const changePasscode = mutation({
  args: { token: v.string(), currentPasscode: v.string(), newPasscode: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('adminSessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      return { success: false, error: 'Session expired. Please log in again.' };
    }

    if (args.newPasscode.length < 4) {
      return { success: false, error: 'Passcode must be at least 4 characters.' };
    }

    const security = await ctx.db.query('adminSecurity').first();
    const currentHash = await hashPasscode(args.currentPasscode);
    const isCurrentValid = security ? security.passcodeHash === currentHash : args.currentPasscode === DEFAULT_PASSCODE;

    if (!isCurrentValid) {
      return { success: false, error: 'Current passcode is incorrect.' };
    }

    const newHash = await hashPasscode(args.newPasscode);
    if (security) {
      await ctx.db.patch(security._id, { passcodeHash: newHash, updatedAt: Date.now() });
    } else {
      await ctx.db.insert('adminSecurity', { passcodeHash: newHash, failedAttempts: 0, updatedAt: Date.now() });
    }

    return { success: true };
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('adminSessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }
    return { success: true };
  },
});
