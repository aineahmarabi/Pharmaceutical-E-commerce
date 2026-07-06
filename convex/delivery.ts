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
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('deliveryZones').collect();
  },
});

export const createZone = mutation({
  args: { name: v.string(), price: v.number(), isActive: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.insert('deliveryZones', args);
  },
});

export const updateZone = mutation({
  args: { id: v.id('deliveryZones'), name: v.string(), price: v.number(), isActive: v.boolean() },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

export const deleteZone = mutation({
  args: { id: v.id('deliveryZones') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
