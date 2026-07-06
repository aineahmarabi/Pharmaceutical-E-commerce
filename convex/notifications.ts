import { query, mutation, internalMutation } from './_generated/server';
import { v } from 'convex/values';

export const listNotifications = query({
  args: { 
    limit: v.optional(v.number()), 
    includeRead: v.optional(v.boolean()) 
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query('notifications').order('desc');
    
    if (args.includeRead === false) {
      q = ctx.db.query('notifications')
        .withIndex('by_read', q => q.eq('read', false))
        .order('desc');
    }
    
    return await q.take(args.limit || 50);
  },
});

export const markAsRead = mutation({
  args: { notificationIds: v.array(v.id('notifications')) },
  handler: async (ctx, { notificationIds }) => {
    for (const id of notificationIds) {
      await ctx.db.patch(id, { read: true });
    }
  },
});

export const createNotification = internalMutation({
  args: {
    type: v.union(v.literal('new_order'), v.literal('low_stock'), v.literal('prescription_approval'), v.literal('refund_processed')),
    title: v.string(),
    message: v.string(),
    targetId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('notifications', {
      ...args,
      read: false,
      createdAt: Date.now(),
    });
  },
});
