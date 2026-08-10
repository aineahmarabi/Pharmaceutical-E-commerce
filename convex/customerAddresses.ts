import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireCustomerId } from './customerAuth';

export const list = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const customerId = await requireCustomerId(ctx, args.token);
    return await ctx.db
      .query('customerAddresses')
      .withIndex('by_customer', (q) => q.eq('customerAccountId', customerId))
      .collect();
  },
});

export const add = mutation({
  args: {
    token: v.string(),
    label: v.string(),
    address: v.string(),
    city: v.string(),
    phone: v.string(),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const customerId = await requireCustomerId(ctx, args.token);

    if (args.isDefault) {
      const existing = await ctx.db
        .query('customerAddresses')
        .withIndex('by_customer', (q) => q.eq('customerAccountId', customerId))
        .collect();
      for (const addr of existing) {
        if (addr.isDefault) await ctx.db.patch(addr._id, { isDefault: false });
      }
    }

    const currentCount = await ctx.db
      .query('customerAddresses')
      .withIndex('by_customer', (q) => q.eq('customerAccountId', customerId))
      .collect();

    await ctx.db.insert('customerAddresses', {
      customerAccountId: customerId,
      label: args.label.trim() || 'Address',
      address: args.address.trim(),
      city: args.city.trim(),
      phone: args.phone.trim(),
      isDefault: args.isDefault ?? currentCount.length === 0,
    });

    return { success: true };
  },
});

export const remove = mutation({
  args: { token: v.string(), addressId: v.id('customerAddresses') },
  handler: async (ctx, args) => {
    const customerId = await requireCustomerId(ctx, args.token);
    const addr = await ctx.db.get(args.addressId);
    if (!addr || addr.customerAccountId !== customerId) return { success: false, error: 'Address not found.' };
    await ctx.db.delete(args.addressId);
    return { success: true };
  },
});

export const setDefault = mutation({
  args: { token: v.string(), addressId: v.id('customerAddresses') },
  handler: async (ctx, args) => {
    const customerId = await requireCustomerId(ctx, args.token);
    const target = await ctx.db.get(args.addressId);
    if (!target || target.customerAccountId !== customerId) return { success: false, error: 'Address not found.' };

    const all = await ctx.db
      .query('customerAddresses')
      .withIndex('by_customer', (q) => q.eq('customerAccountId', customerId))
      .collect();
    for (const addr of all) {
      await ctx.db.patch(addr._id, { isDefault: addr._id === args.addressId });
    }
    return { success: true };
  },
});
