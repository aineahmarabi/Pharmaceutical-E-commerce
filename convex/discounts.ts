import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const listDiscounts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('discounts').order('desc').collect();
  },
});

export const createDiscount = mutation({
  args: {
    code: v.string(),
    title: v.optional(v.string()),
    type: v.union(v.literal('percentage'), v.literal('fixed'), v.literal('buyXgetY'), v.literal('freeShipping')),
    value: v.number(),
    appliesTo: v.optional(v.union(v.literal('allProducts'), v.literal('specificCollections'), v.literal('specificProducts'))),
    targetIds: v.optional(v.array(v.string())),
    minimumType: v.optional(v.union(v.literal('none'), v.literal('amount'), v.literal('quantity'))),
    minimumValue: v.optional(v.number()),
    eligibility: v.optional(v.union(v.literal('everyone'), v.literal('segment'), v.literal('specificCustomers'))),
    eligibleIds: v.optional(v.array(v.string())),
    usageLimit: v.optional(v.number()),
    oncePerCustomer: v.optional(v.boolean()),
    combinesWithProductDiscounts: v.optional(v.boolean()),
    combinesWithOrderDiscounts: v.optional(v.boolean()),
    combinesWithShipping: v.optional(v.boolean()),
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    status: v.union(v.literal('active'), v.literal('scheduled'), v.literal('expired')),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('discounts')
      .withIndex('by_code', q => q.eq('code', args.code))
      .first();
    if (existing) throw new Error('Discount code already exists');
    
    await ctx.db.insert('discounts', {
      ...args,
      usedCount: 0,
    });
  },
});

export const updateDiscount = mutation({
  args: {
    id: v.id('discounts'),
    code: v.optional(v.string()),
    title: v.optional(v.string()),
    type: v.optional(v.union(v.literal('percentage'), v.literal('fixed'), v.literal('buyXgetY'), v.literal('freeShipping'))),
    value: v.optional(v.number()),
    appliesTo: v.optional(v.union(v.literal('allProducts'), v.literal('specificCollections'), v.literal('specificProducts'))),
    targetIds: v.optional(v.array(v.string())),
    minimumType: v.optional(v.union(v.literal('none'), v.literal('amount'), v.literal('quantity'))),
    minimumValue: v.optional(v.number()),
    eligibility: v.optional(v.union(v.literal('everyone'), v.literal('segment'), v.literal('specificCustomers'))),
    eligibleIds: v.optional(v.array(v.string())),
    usageLimit: v.optional(v.number()),
    oncePerCustomer: v.optional(v.boolean()),
    combinesWithProductDiscounts: v.optional(v.boolean()),
    combinesWithOrderDiscounts: v.optional(v.boolean()),
    combinesWithShipping: v.optional(v.boolean()),
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    status: v.optional(v.union(v.literal('active'), v.literal('scheduled'), v.literal('expired'))),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => {
    await ctx.db.patch(id, updates);
  },
});

export const deactivateDiscount = mutation({
  args: { id: v.id('discounts') },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { active: false, status: 'expired' });
  },
});

export const validateDiscountCode = query({
  args: { code: v.string(), cartValue: v.number() },
  handler: async (ctx, { code, cartValue }) => {
    const discount = await ctx.db.query('discounts')
      .withIndex('by_code', q => q.eq('code', code))
      .first();
      
    if (!discount) return { valid: false, error: 'Invalid code' };
    if (!discount.active || discount.status === 'expired') return { valid: false, error: 'Code is inactive' };
    if (discount.endsAt && discount.endsAt < Date.now()) return { valid: false, error: 'Code has expired' };
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) return { valid: false, error: 'Usage limit reached' };
    if (discount.minimumType === 'amount' && discount.minimumValue && cartValue < discount.minimumValue) {
      return { valid: false, error: `Minimum order value of ${discount.minimumValue} required` };
    }
    
    return { valid: true, discount };
  },
});
