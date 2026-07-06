import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// ─── ADMIN QUERIES (includes out-of-stock) ──────────────────────────────────

export const adminListProducts = query({
  args: {
    limit: v.optional(v.number()),
    categorySlug: v.optional(v.string()),
    status: v.optional(v.union(v.literal('active'), v.literal('draft'), v.literal('archived'))),
    brandSlug: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query('products');
    
    if (args.categorySlug) {
      q = ctx.db.query('products').withIndex('by_category', (idx) => idx.eq('categorySlug', args.categorySlug!)) as any;
    }
    
    let results = await q.take(args.limit || 100);

    if (args.brandSlug) {
      results = results.filter(p => p.brandSlug === args.brandSlug);
    }
    if (args.search) {
      const s = args.search.toLowerCase();
      results = results.filter(p => p.name.toLowerCase().includes(s) || p.slug.includes(s));
    }
    
    return Promise.all(
      results.map(async (p) => ({
        ...p,
        imageUrl: p.imageStorageId
          ? (await ctx.storage.getUrl(p.imageStorageId)) ?? p.imageUrl
          : p.imageUrl,
      }))
    );
  },
});

export const adminGetProduct = query({
  args: { id: v.id('products') },
  handler: async (ctx, { id }) => {
    const p = await ctx.db.get(id);
    if (!p) return null;
    return {
      ...p,
      imageUrl: p.imageStorageId
        ? (await ctx.storage.getUrl(p.imageStorageId)) ?? p.imageUrl
        : p.imageUrl,
    };
  },
});

export const createProduct = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    brand: v.string(),
    brandSlug: v.string(),
    genericName: v.string(),
    category: v.string(),
    categorySlug: v.string(),
    conditions: v.array(v.string()),
    classification: v.union(v.literal('OTC'), v.literal('P'), v.literal('POM')),
    form: v.string(),
    strength: v.string(),
    packSize: v.string(),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    description: v.string(),
    directions: v.string(),
    warnings: v.string(),
    ingredients: v.string(),
    inStock: v.boolean(),
    stockQty: v.number(),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('products').withIndex('by_slug', (q) => q.eq('slug', args.slug)).first();
    if (existing) throw new Error('Product with this slug already exists.');
    return await ctx.db.insert('products', {
      ...args,
      isNew: true,
    });
  },
});

export const updateProduct = mutation({
  args: {
    id: v.id('products'),
    updates: v.object({
      name: v.optional(v.string()),
      slug: v.optional(v.string()),
      price: v.optional(v.number()),
      compareAtPrice: v.optional(v.number()),
      inStock: v.optional(v.boolean()),
      stockQty: v.optional(v.number()),
      category: v.optional(v.string()),
      categorySlug: v.optional(v.string()),
      brand: v.optional(v.string()),
      brandSlug: v.optional(v.string()),
      description: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      imageStorageId: v.optional(v.id('_storage')),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    await ctx.db.patch(id, updates);
  },
});

export const duplicateProduct = mutation({
  args: { id: v.id('products') },
  handler: async (ctx, { id }) => {
    const p = await ctx.db.get(id);
    if (!p) throw new Error('Not found');
    
    const { _id, _creationTime, ...data } = p;
    return await ctx.db.insert('products', {
      ...data,
      name: `${data.name} (Copy)`,
      slug: `${data.slug}-copy-${Math.floor(Math.random() * 10000)}`,
      inStock: false,
      stockQty: 0,
    });
  },
});

export const archiveProduct = mutation({
  args: { id: v.id('products') },
  handler: async (ctx, { id }) => {
    // We just unlist it
    await ctx.db.patch(id, { inStock: false, stockQty: 0 });
  },
});

export const unarchiveProduct = mutation({
  args: { id: v.id('products') },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { inStock: true });
  },
});

export const adminDeleteProduct = mutation({
  args: { id: v.id('products') },
  handler: async (ctx, { id }) => {
    const p = await ctx.db.get(id);
    if (p?.imageStorageId) {
      await ctx.storage.delete(p.imageStorageId);
    }
    await ctx.db.delete(id);
  },
});

export const adminToggleStock = mutation({
  args: { id: v.id('products'), inStock: v.boolean() },
  handler: async (ctx, { id, inStock }) => {
    await ctx.db.patch(id, { inStock });
  },
});
