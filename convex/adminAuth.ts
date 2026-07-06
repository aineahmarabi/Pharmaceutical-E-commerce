import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

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
    // Hardcoded simple passcode for the initial admin MVP, as requested for speed.
    // In production, we compare against adminSecurity table hash.
    const MASTER_PASSCODE = "14328"; // We can make this dynamic later

    if (args.passcode !== MASTER_PASSCODE) {
      // Record failed attempt
      const security = await ctx.db.query('adminSecurity').first();
      if (security) {
        await ctx.db.patch(security._id, {
          failedAttempts: security.failedAttempts + 1,
          lastFailedAt: Date.now(),
        });
      }
      return { success: false, error: 'Invalid passcode' };
    }

    // Generate token
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    // Create session (valid for 24 hours)
    await ctx.db.insert('adminSessions', {
      token,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    return { success: true, token };
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
