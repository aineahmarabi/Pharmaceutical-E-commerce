import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const getStoreSettings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('storeSettings').collect();
  },
});

export const getStoreSetting = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    return await ctx.db.query('storeSettings')
      .withIndex('by_key', q => q.eq('key', key))
      .first();
  },
});

export const updateStoreSetting = mutation({
  args: { key: v.string(), value: v.any() },
  handler: async (ctx, { key, value }) => {
    const existing = await ctx.db.query('storeSettings')
      .withIndex('by_key', q => q.eq('key', key))
      .first();
      
    if (existing) {
      await ctx.db.patch(existing._id, { value });
    } else {
      await ctx.db.insert('storeSettings', { key, value });
    }
  },
});
