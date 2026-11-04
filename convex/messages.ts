import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireStaff, MANAGERS } from './adminGuard';
import { lockedForMs, recordFailure } from './throttle';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const submitContactMessage = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const email = args.email.trim();
    const subject = args.subject?.trim() || undefined;
    const message = args.message.trim();

    if (!name || name.length > 100) throw new Error('Please enter your name (100 characters or fewer).');
    if (email.length > 254 || !EMAIL_RE.test(email)) throw new Error('Please enter a valid email address.');
    if (subject && subject.length > 200) throw new Error('The subject is too long.');
    if (!message || message.length > 2000) throw new Error('Please enter a message (2000 characters or fewer).');

    const key = `contact:${email.toLowerCase()}`;
    if ((await lockedForMs(ctx, key)) > 0) {
      throw new Error('You have sent several messages recently. Please try again in 15 minutes.');
    }
    await recordFailure(ctx, key, 5);

    await ctx.db.insert('contactMessages', {
      name,
      email,
      subject,
      message,
      read: false,
      createdAt: Date.now(),
    });

    await ctx.db.insert('notifications', {
      type: 'new_message',
      title: 'New contact message',
      message: `${name}: ${subject || message.slice(0, 60)}`,
      read: false,
      createdAt: Date.now(),
    });
  },
});

export const listMessages = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireStaff(ctx, token, MANAGERS);
    return await ctx.db.query('contactMessages').order('desc').collect();
  },
});

export const markMessageRead = mutation({
  args: { token: v.string(), id: v.id('contactMessages') },
  handler: async (ctx, { token, id }) => {
    await requireStaff(ctx, token, MANAGERS);
    await ctx.db.patch(id, { read: true });
  },
});
