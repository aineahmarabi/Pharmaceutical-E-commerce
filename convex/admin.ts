import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// ─── BRANDS ─────────────────────────────────────────────────────────────────
export const listBrands = query({
  handler: async (ctx) => {
    return await ctx.db.query('brands').collect();
  },
});

export const createBrand = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('brands').withIndex('by_slug', (q) => q.eq('slug', args.slug)).first();
    if (existing) throw new Error('Brand with this slug already exists.');
    return await ctx.db.insert('brands', {
      ...args,
      productCount: 0,
    });
  },
});

export const deleteBrand = mutation({
  args: { id: v.id('brands') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// ─── CATEGORIES ─────────────────────────────────────────────────────────────
export const listCategories = query({
  handler: async (ctx) => {
    return await ctx.db.query('categories').collect();
  },
});

export const createCategory = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('categories').withIndex('by_slug', (q) => q.eq('slug', args.slug)).first();
    if (existing) throw new Error('Category with this slug already exists.');
    return await ctx.db.insert('categories', {
      ...args,
      productCount: 0,
    });
  },
});

export const deleteCategory = mutation({
  args: { id: v.id('categories') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// ─── CONDITIONS ─────────────────────────────────────────────────────────────
export const listConditions = query({
  handler: async (ctx) => {
    return await ctx.db.query('conditions').collect();
  },
});

export const createCondition = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('conditions').withIndex('by_slug', (q) => q.eq('slug', args.slug)).first();
    if (existing) throw new Error('Condition with this slug already exists.');
    return await ctx.db.insert('conditions', {
      ...args,
      productCount: 0,
    });
  },
});

export const deleteCondition = mutation({
  args: { id: v.id('conditions') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// ─── ORDERS ─────────────────────────────────────────────────────────────────
export const listOrders = query({
  handler: async (ctx) => {
    return await ctx.db.query('orders').order('desc').collect();
  },
});

export const updateOrderStatus = mutation({
  args: { id: v.id('orders'), status: v.string() },
  handler: async (ctx, { id, status }) => {
    // @ts-ignore
    await ctx.db.patch(id, { status });
  },
});

