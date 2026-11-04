import { requireStaff, ANY_STAFF, MANAGERS } from './adminGuard';
import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// ─── ADMIN QUERIES (includes out-of-stock) ──────────────────────────────────

export const adminListProducts = query({
  args: { token: v.string(),
    limit: v.optional(v.number()),
    categorySlug: v.optional(v.string()),
    status: v.optional(v.union(v.literal('active'), v.literal('draft'), v.literal('archived'))),
    brandSlug: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, ANY_STAFF);
    const q = args.categorySlug
      ? ctx.db.query('products').withIndex('by_category', (idx) => idx.eq('categorySlug', args.categorySlug!))
      : ctx.db.query('products');

    let results = await q.take(args.limit || 100);

    if (args.brandSlug) {
      results = results.filter(p => p.brandSlug === args.brandSlug);
    }
    if (args.search) {
      const s = args.search.toLowerCase();
      results = results.filter(p => p.name.toLowerCase().includes(s) || p.slug.includes(s) || (p.sku ?? '').toLowerCase() === s || (p.barcode ?? '').toLowerCase() === s);
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
  args: { token: v.string(), id: v.id('products') },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, ANY_STAFF);
    const { id } = args;
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
  args: { token: v.string(),
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
    sku: v.optional(v.string()),
    barcode: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, MANAGERS);
    const existing = await ctx.db.query('products').withIndex('by_slug', (q) => q.eq('slug', args.slug)).first();
    if (existing) throw new Error('Product with this slug already exists.');
    const { token: _token, ...data } = args;
    return await ctx.db.insert('products', {
      ...data,
      isNew: true,
    });
  },
});

export const updateProduct = mutation({
  args: { token: v.string(),
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
      genericName: v.optional(v.string()),
      classification: v.optional(v.union(v.literal('OTC'), v.literal('P'), v.literal('POM'))),
      form: v.optional(v.string()),
      strength: v.optional(v.string()),
      packSize: v.optional(v.string()),
      description: v.optional(v.string()),
      directions: v.optional(v.string()),
      warnings: v.optional(v.string()),
      ingredients: v.optional(v.string()),
      manufacturer: v.optional(v.string()),
      sku: v.optional(v.string()),
      barcode: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      imageStorageId: v.optional(v.id('_storage')),
      isNew: v.optional(v.boolean()),
      isTrending: v.optional(v.boolean()),
      isBestSeller: v.optional(v.boolean()),
      isOffer: v.optional(v.boolean()),
      offerEndsAt: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, MANAGERS);
    const { id, updates } = args;
    await ctx.db.patch(id, updates);
    await ctx.db.insert('auditLog', {
      action: 'UPDATE_PRODUCT',
      targetType: 'product',
      targetId: id,
      createdAt: Date.now(),
    });
  },
});

export const duplicateProduct = mutation({
  args: { token: v.string(), id: v.id('products') },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, MANAGERS);
    const { id } = args;
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
  args: { token: v.string(), id: v.id('products') },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, MANAGERS);
    const { id } = args;
    // We just unlist it
    await ctx.db.patch(id, { inStock: false, stockQty: 0 });
  },
});

export const unarchiveProduct = mutation({
  args: { token: v.string(), id: v.id('products') },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, MANAGERS);
    const { id } = args;
    await ctx.db.patch(id, { inStock: true });
  },
});

export const adminDeleteProduct = mutation({
  args: { token: v.string(), id: v.id('products') },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, MANAGERS);
    const { id } = args;
    const p = await ctx.db.get(id);
    if (p?.imageStorageId) {
      await ctx.storage.delete(p.imageStorageId);
    }
    await ctx.db.delete(id);
  },
});

export const adminToggleStock = mutation({
  args: { token: v.string(), id: v.id('products'), inStock: v.boolean() },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, MANAGERS);
    const { id, inStock } = args;
    await ctx.db.patch(id, { inStock });
  },
});
