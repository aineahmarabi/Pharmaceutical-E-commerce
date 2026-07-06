import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';

// Helper to hash passcode (SHA-256 for simplicity in Convex runtime)
async function hashPasscode(passcode: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(passcode);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const setInitialPasscode = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('adminSecurity').first();
    if (existing) return;
    const hash = await hashPasscode('14328');
    await ctx.db.insert('adminSecurity', {
      passcodeHash: hash,
      failedAttempts: 0,
      updatedAt: Date.now(),
    });
  },
});

export const verifyPasscode = mutation({
  args: { passcode: v.string() },
  handler: async (ctx, { passcode }) => {
    const security = await ctx.db.query('adminSecurity').first();
    if (!security) throw new Error('Security not initialized');

    if (security.failedAttempts >= 5) {
      const lockTime = 60 * 1000; // 60 seconds
      if (security.lastFailedAt && Date.now() - security.lastFailedAt < lockTime) {
        throw new Error('Too many failed attempts. Locked out.');
      } else if (security.lastFailedAt && Date.now() - security.lastFailedAt >= lockTime) {
        // cooldown over, reset for this attempt
        await ctx.db.patch(security._id, { failedAttempts: 0 });
      }
    }

    const hash = await hashPasscode(passcode);
    if (hash === security.passcodeHash) {
      // Success
      await ctx.db.patch(security._id, { failedAttempts: 0, lastFailedAt: undefined });
      const token = crypto.randomUUID();
      await ctx.db.insert('adminSessions', {
        token,
        createdAt: Date.now(),
        expiresAt: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
      });
      return token;
    } else {
      // Failure
      await ctx.db.patch(security._id, {
        failedAttempts: (security.failedAttempts || 0) + 1,
        lastFailedAt: Date.now(),
      });
      throw new Error('Invalid passcode');
    }
  },
});

export const changePasscode = mutation({
  args: { currentPasscode: v.string(), newPasscode: v.string() },
  handler: async (ctx, { currentPasscode, newPasscode }) => {
    const security = await ctx.db.query('adminSecurity').first();
    if (!security) throw new Error('Not initialized');

    const currentHash = await hashPasscode(currentPasscode);
    if (currentHash !== security.passcodeHash) {
      throw new Error('Current passcode incorrect');
    }

    const newHash = await hashPasscode(newPasscode);
    await ctx.db.patch(security._id, {
      passcodeHash: newHash,
      updatedAt: Date.now(),
    });

    // Write audit log
    await ctx.db.insert('auditLog', {
      action: 'CHANGE_PASSCODE',
      targetType: 'system',
      createdAt: Date.now(),
    });
  },
});

export const checkLockout = query({
  args: {},
  handler: async (ctx) => {
    const security = await ctx.db.query('adminSecurity').first();
    if (!security) return false;
    
    if (security.failedAttempts >= 5) {
      const lockTime = 60 * 1000;
      if (security.lastFailedAt && Date.now() - security.lastFailedAt < lockTime) {
        return true;
      }
    }
    return false;
  },
});

export const resetFailedAttempts = mutation({
  args: {},
  handler: async (ctx) => {
    const security = await ctx.db.query('adminSecurity').first();
    if (security) {
      await ctx.db.patch(security._id, { failedAttempts: 0, lastFailedAt: undefined });
    }
  },
});

export const validateSession = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query('adminSessions')
      .withIndex('by_token', (q) => q.eq('token', token))
      .first();
    if (!session) return null;
    if (session.expiresAt < Date.now()) return null;
    
    // Optionally fetch staff if staffId is attached
    let staff = null;
    if (session.staffId) {
      staff = await ctx.db.get(session.staffId);
    }
    return { session, staff };
  },
});

export const extendSession = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query('adminSessions')
      .withIndex('by_token', (q) => q.eq('token', token))
      .first();
    if (session && session.expiresAt > Date.now()) {
      await ctx.db.patch(session._id, {
        expiresAt: Date.now() + 1000 * 60 * 60 * 24, // Extend by 24h
      });
    }
  },
});

export const lockSession = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query('adminSessions')
      .withIndex('by_token', (q) => q.eq('token', token))
      .first();
    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});
