import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// ─── Helper: resolve image URL from storage or fallback ────────────────────
async function resolveImageUrl(
  ctx: { storage: { getUrl: (id: string) => Promise<string | null> } },
  storageId: string | undefined,
  fallback: string | undefined
): Promise<string | undefined> {
  if (storageId) {
    const url = await ctx.storage.getUrl(storageId);
    return url ?? fallback;
  }
  return fallback;
}

// ─── CLIENT-FACING QUERIES (never return out-of-stock) ─────────────────────

/** Trending products — excludes out-of-stock */
export const listTrending = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 8 }) => {
    const products = await ctx.db
      .query('products')
      .withIndex('by_trending', (q) => q.eq('isTrending', true))
      .filter((q) => q.eq(q.field('inStock'), true))
      .take(limit);
    return Promise.all(
      products.map(async (p) => ({
        ...p,
        imageUrl: await resolveImageUrl(ctx, p.imageStorageId, p.imageUrl),
      }))
    );
  },
});

/** Best-sellers — excludes out-of-stock */
export const listBestSellers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 8 }) => {
    const products = await ctx.db
      .query('products')
      .withIndex('by_best_seller', (q) => q.eq('isBestSeller', true))
      .filter((q) => q.eq(q.field('inStock'), true))
      .take(limit);
    return Promise.all(
      products.map(async (p) => ({
        ...p,
        imageUrl: await resolveImageUrl(ctx, p.imageStorageId, p.imageUrl),
      }))
    );
  },
});

/** New arrivals — excludes out-of-stock */
export const listNewArrivals = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 8 }) => {
    const products = await ctx.db
      .query('products')
      .withIndex('by_new', (q) => q.eq('isNew', true))
      .filter((q) => q.eq(q.field('inStock'), true))
      .take(limit);
    return Promise.all(
      products.map(async (p) => ({
        ...p,
        imageUrl: await resolveImageUrl(ctx, p.imageStorageId, p.imageUrl),
      }))
    );
  },
});

/** Special offers — excludes out-of-stock */
export const listOffers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 6 }) => {
    const products = await ctx.db
      .query('products')
      .withIndex('by_offer', (q) => q.eq('isOffer', true))
      .filter((q) => q.eq(q.field('inStock'), true))
      .take(limit);
    return Promise.all(
      products.map(async (p) => ({
        ...p,
        imageUrl: await resolveImageUrl(ctx, p.imageStorageId, p.imageUrl),
      }))
    );
  },
});

/** Products by category — excludes out-of-stock */
export const listByCategory = query({
  args: { categorySlug: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { categorySlug, limit = 20 }) => {
    const products = await ctx.db
      .query('products')
      .withIndex('by_category', (q) => q.eq('categorySlug', categorySlug))
      .filter((q) => q.eq(q.field('inStock'), true))
      .take(limit);
    return Promise.all(
      products.map(async (p) => ({
        ...p,
        imageUrl: await resolveImageUrl(ctx, p.imageStorageId, p.imageUrl),
      }))
    );
  },
});

/** Single product by slug — still shown even if OOS on detail page */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const product = await ctx.db
      .query('products')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .first();
    if (!product) return null;
    return {
      ...product,
      imageUrl: await resolveImageUrl(ctx, product.imageStorageId, product.imageUrl),
    };
  },
});

/** Hero featured products: 3 trending in-stock products */
export const listHeroFeatured = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query('products')
      .withIndex('by_trending', (q) => q.eq('isTrending', true))
      .filter((q) => q.eq(q.field('inStock'), true))
      .take(3);
    return Promise.all(
      products.map(async (p) => ({
        ...p,
        imageUrl: await resolveImageUrl(ctx, p.imageStorageId, p.imageUrl),
      }))
    );
  },
});

/** Full-text search — excludes out-of-stock */
export const searchProducts = query({
  args: { term: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { term, limit = 20 }) => {
    if (!term.trim()) return [];
    const all = await ctx.db
      .query('products')
      .filter((q) => q.eq(q.field('inStock'), true))
      .collect();
    const lower = term.toLowerCase();
    const filtered = all
      .filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.genericName.toLowerCase().includes(lower) ||
          p.brand.toLowerCase().includes(lower) ||
          p.category.toLowerCase().includes(lower)
      )
      .slice(0, limit);
    return Promise.all(
      filtered.map(async (p) => ({
        ...p,
        imageUrl: await resolveImageUrl(ctx, p.imageStorageId, p.imageUrl),
      }))
    );
  },
});

// ─── MUTATIONS ─────────────────────────────────────────────────────────────

/** Generate a Convex upload URL for product images */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/** Save product */
export const upsertProduct = mutation({
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
    imageStorageId: v.optional(v.id('_storage')),
    imageUrl: v.optional(v.string()),
    inStock: v.boolean(),
    stockQty: v.number(),
    isNew: v.optional(v.boolean()),
    isTrending: v.optional(v.boolean()),
    isBestSeller: v.optional(v.boolean()),
    isOffer: v.optional(v.boolean()),
    rating: v.optional(v.number()),
    reviewCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('products')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert('products', args);
  },
});

/** Update product stock */
export const updateStock = mutation({
  args: { slug: v.string(), stockQty: v.number(), inStock: v.boolean() },
  handler: async (ctx, { slug, stockQty, inStock }) => {
    const product = await ctx.db
      .query('products')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .first();
    if (!product) throw new Error(`Product not found: ${slug}`);
    await ctx.db.patch(product._id, { stockQty, inStock });
  },
});

// ─── ADMIN QUERIES & MUTATIONS ─────────────────────────────────────────────

export const adminListProducts = query({
  args: {
    category: v.optional(v.string()),
    stockStatus: v.optional(v.string()), // 'in_stock' | 'out_of_stock'
    classification: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query('products').order('desc');
    let results = await q.collect();

    if (args.category) {
      results = results.filter((r) => r.category === args.category);
    }
    if (args.stockStatus === 'in_stock') {
      results = results.filter((r) => r.inStock === true);
    } else if (args.stockStatus === 'out_of_stock') {
      results = results.filter((r) => r.inStock === false);
    }
    if (args.classification) {
      results = results.filter((r) => r.classification === args.classification);
    }

    return results.slice(0, args.limit || 100);
  },
});

export const adminGetProductById = query({
  args: { id: v.id('products') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const adminCreateProduct = mutation({
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
    imageStorageId: v.optional(v.id('_storage')),
    imageUrl: v.optional(v.string()),
    inStock: v.boolean(),
    stockQty: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert('products', args);
    await ctx.db.insert('auditLog', {
      action: 'CREATE_PRODUCT',
      targetType: 'product',
      targetId: id,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const adminUpdateProduct = mutation({
  args: {
    id: v.id('products'),
    updates: v.any(), // Record of updates matching schema
  },
  handler: async (ctx, { id, updates }) => {
    await ctx.db.patch(id, updates);
    await ctx.db.insert('auditLog', {
      action: 'UPDATE_PRODUCT',
      targetType: 'product',
      targetId: id,
      createdAt: Date.now(),
    });
  },
});

export const adminDeleteProduct = mutation({
  args: { id: v.id('products') },
  handler: async (ctx, { id }) => {
    // Instead of active=false, we set inStock=false to soft-hide it from clients since we can't change schema
    await ctx.db.patch(id, { inStock: false, stockQty: 0 });
    await ctx.db.insert('auditLog', {
      action: 'ARCHIVE_PRODUCT',
      targetType: 'product',
      targetId: id,
      createdAt: Date.now(),
    });
  },
});

export const bulkExportCsv = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('products').collect();
  }
});

