import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireCustomerId } from './customerAuth';

const DAY_MS = 24 * 60 * 60 * 1000;
const ALLOWED_DAYS = [14, 30, 60, 90];
const MAX_ACTIVE = 20;

/** A signed-in customer's active reminders, soonest first. Nothing is returned for an invalid session. */
export const listMine = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    let customerId;
    try {
      customerId = await requireCustomerId(ctx, token);
    } catch {
      return [];
    }
    const rows = await ctx.db
      .query('refillReminders')
      .withIndex('by_customer', (q) => q.eq('customerAccountId', customerId))
      .collect();
    return rows
      .filter((r) => r.status === 'scheduled')
      .sort((a, b) => a.remindAt - b.remindAt)
      .map((r) => ({
        _id: r._id,
        orderId: r.orderId,
        orderNumber: r.orderNumber,
        items: r.items,
        remindAt: r.remindAt,
      }));
  },
});

export const create = mutation({
  args: { token: v.string(), orderId: v.id('orders'), days: v.number() },
  handler: async (ctx, { token, orderId, days }) => {
    const customerId = await requireCustomerId(ctx, token);
    if (!ALLOWED_DAYS.includes(days)) return { success: false, error: 'Choose 14, 30, 60 or 90 days.' };

    const order = await ctx.db.get(orderId);
    // The order must belong to this customer (never trust the id alone).
    if (!order || order.customerId !== (customerId as string)) return { success: false, error: 'Order not found.' };
    if (order.status === 'cancelled') return { success: false, error: 'This order was cancelled.' };

    const mine = await ctx.db
      .query('refillReminders')
      .withIndex('by_customer', (q) => q.eq('customerAccountId', customerId))
      .collect();
    const active = mine.filter((r) => r.status === 'scheduled');
    if (active.length >= MAX_ACTIVE) return { success: false, error: 'You have too many active reminders. Remove one first.' };

    // One active reminder per order: setting it again replaces the date.
    const existing = active.find((r) => r.orderId === orderId);
    const remindAt = Date.now() + days * DAY_MS;
    if (existing) {
      await ctx.db.patch(existing._id, { remindAt });
      return { success: true };
    }
    await ctx.db.insert('refillReminders', {
      customerAccountId: customerId,
      orderId,
      orderNumber: order.orderNumber,
      items: order.items.map((i) => ({ productId: i.productId, name: i.name, qty: i.qty })),
      remindAt,
      status: 'scheduled',
      createdAt: Date.now(),
    });
    return { success: true };
  },
});

async function ownReminder(ctx: Parameters<typeof requireCustomerId>[0], token: string, id: string) {
  const customerId = await requireCustomerId(ctx, token);
  const row = await ctx.db.get(id as never) as { customerAccountId?: string } | null;
  if (!row || row.customerAccountId !== (customerId as string)) return null;
  return row;
}

export const dismiss = mutation({
  args: { token: v.string(), id: v.id('refillReminders') },
  handler: async (ctx, { token, id }) => {
    if (!(await ownReminder(ctx, token, id))) return { success: false };
    await ctx.db.patch(id, { status: 'dismissed' });
    return { success: true };
  },
});

export const complete = mutation({
  args: { token: v.string(), id: v.id('refillReminders') },
  handler: async (ctx, { token, id }) => {
    if (!(await ownReminder(ctx, token, id))) return { success: false };
    await ctx.db.patch(id, { status: 'done' });
    return { success: true };
  },
});
