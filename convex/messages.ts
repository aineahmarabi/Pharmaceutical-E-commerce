import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const submitContactMessage = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('contactMessages', {
      ...args,
      read: false,
      createdAt: Date.now(),
    });

    await ctx.db.insert('notifications', {
      type: 'new_message',
      title: 'New contact message',
      message: `${args.name}: ${args.subject || args.message.slice(0, 60)}`,
      read: false,
      createdAt: Date.now(),
    });
  },
});

export const listMessages = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('contactMessages').order('desc').collect();
  },
});

export const markMessageRead = mutation({
  args: { id: v.id('contactMessages') },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { read: true });
  },
});
