import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Categories
export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    const cats = await ctx.db.query('categories').collect();
    return Promise.all(cats.map(async (c) => ({
      ...c,
      imageUrl: c.imageStorageId ? await ctx.storage.getUrl(c.imageStorageId) : c.imageUrl
    })));
  }
});
export const createCategory = mutation({
  args: { name: v.string(), description: v.string(), imageStorageId: v.optional(v.id('_storage')) },
  handler: async (ctx, args) => {
    const slug = args.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    await ctx.db.insert('categories', { ...args, slug, productCount: 0 });
  }
});
export const deleteCategory = mutation({
  args: { id: v.id('categories') },
  handler: async (ctx, args) => ctx.db.delete(args.id)
});

// Brands
export const listBrands = query({
  args: {},
  handler: async (ctx) => {
    const brands = await ctx.db.query('brands').collect();
    return Promise.all(brands.map(async (b) => ({
      ...b,
      imageUrl: b.imageStorageId ? await ctx.storage.getUrl(b.imageStorageId) : b.imageUrl
    })));
  }
});
export const createBrand = mutation({
  args: { name: v.string(), description: v.string(), imageStorageId: v.optional(v.id('_storage')) },
  handler: async (ctx, args) => {
    const slug = args.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    await ctx.db.insert('brands', { ...args, slug, productCount: 0 });
  }
});
export const deleteBrand = mutation({
  args: { id: v.id('brands') },
  handler: async (ctx, args) => ctx.db.delete(args.id)
});

// Conditions
export const listConditions = query({
  args: {},
  handler: async (ctx) => {
    const conds = await ctx.db.query('conditions').collect();
    return Promise.all(conds.map(async (c) => ({
      ...c,
      imageUrl: c.imageStorageId ? await ctx.storage.getUrl(c.imageStorageId) : c.imageUrl
    })));
  }
});
export const createCondition = mutation({
  args: { name: v.string(), description: v.string(), imageStorageId: v.optional(v.id('_storage')) },
  handler: async (ctx, args) => {
    const slug = args.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    await ctx.db.insert('conditions', { ...args, slug, productCount: 0 });
  }
});
export const deleteCondition = mutation({
  args: { id: v.id('conditions') },
  handler: async (ctx, args) => ctx.db.delete(args.id)
});
