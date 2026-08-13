import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export const subscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normalized = email.trim().toLowerCase();
    if (!EMAIL_RE.test(normalized)) throw new Error('Enter a valid email address.');

    const existing = await ctx.db
      .query('newsletterSubscribers')
      .withIndex('by_email', (q) => q.eq('email', normalized))
      .first();

    if (existing) {
      if (!existing.subscribed) await ctx.db.patch(existing._id, { subscribed: true });
      return;
    }

    await ctx.db.insert('newsletterSubscribers', {
      email: normalized,
      subscribed: true,
      createdAt: Date.now(),
    });

    await ctx.db.insert('notifications', {
      type: 'new_subscriber',
      title: 'New newsletter subscriber',
      message: normalized,
      read: false,
      createdAt: Date.now(),
    });
  },
});

export const unsubscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normalized = email.trim().toLowerCase();
    const existing = await ctx.db
      .query('newsletterSubscribers')
      .withIndex('by_email', (q) => q.eq('email', normalized))
      .first();
    if (existing) await ctx.db.patch(existing._id, { subscribed: false });
  },
});

export const listSubscribers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('newsletterSubscribers').order('desc').collect();
  },
});
