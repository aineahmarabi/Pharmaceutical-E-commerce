import { requireStaff, MANAGERS } from './adminGuard';
import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const listZones = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('deliveryZones')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();
  },
});

export const adminListZones = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, MANAGERS);
    return await ctx.db.query('deliveryZones').collect();
  },
});

export const createZone = mutation({
  args: { token: v.string(), name: v.string(), price: v.number(), isActive: v.boolean() },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, MANAGERS);
    await ctx.db.insert('deliveryZones', { name: args.name, price: args.price, isActive: args.isActive });
  },
});

export const updateZone = mutation({
  args: { token: v.string(), id: v.id('deliveryZones'), name: v.string(), price: v.number(), isActive: v.boolean() },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, MANAGERS);
    const { id, token: _token, ...rest } = args;
    if (!rest.name.trim()) throw new Error('A zone needs a name.');
    if (!Number.isFinite(rest.price) || rest.price < 0) throw new Error('The rate must be zero or more.');
    await ctx.db.patch(id, { ...rest, name: rest.name.trim() });
  },
});

export const deleteZone = mutation({
  args: { token: v.string(), id: v.id('deliveryZones') },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, MANAGERS);
    await ctx.db.delete(args.id);
  },
});
