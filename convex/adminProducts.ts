import { requireStaff, ANY_STAFF, MANAGERS } from './adminGuard';
import { query, mutation, type QueryCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';
import { applyStockChange } from './inventory';
import { v } from 'convex/values';

/** SKU and barcode identify one product only: a duplicate would send POS scans to the wrong item. */
async function assertUniqueCodes(
  ctx: { db: QueryCtx['db'] },
  codes: { sku?: string; barcode?: string },
  exceptId?: Id<'products'>,
) {
  const sku = codes.sku?.trim();
  if (sku) {
    const clash = await ctx.db.query('products').withIndex('by_sku', (q) => q.eq('sku', sku)).first();
    if (clash && clash._id !== exceptId) throw new Error(`The SKU "${sku}" is already used by "${clash.name}".`);
  }
  const barcode = codes.barcode?.trim();
  if (barcode) {
    const clash = await ctx.db.query('products').withIndex('by_barcode', (q) => q.eq('barcode', barcode)).first();
    if (clash && clash._id !== exceptId) throw new Error(`The barcode "${barcode}" is already used by "${clash.name}".`);
  }
}

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
    const sku = data.sku?.trim() || undefined;
    const barcode = data.barcode?.trim() || undefined;
    await assertUniqueCodes(ctx, { sku, barcode });
    if (!Number.isInteger(data.stockQty) || data.stockQty < 0) throw new Error('Stock must be a whole number, zero or more.');
    const id = await ctx.db.insert('products', {
      ...data,
      sku,
      barcode,
      inStock: data.stockQty > 0 && data.inStock,
      isNew: true,
    });
    if (data.stockQty > 0) {
      await ctx.db.insert('inventoryLog', { productId: id, changeAmount: data.stockQty, reason: 'Opening stock', createdAt: Date.now() });
    }
    return id;
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
    const current = await ctx.db.get(id);
    if (!current) throw new Error('Product not found');
    const { stockQty, inStock, ...rest } = updates;
    const patch: typeof rest = { ...rest };
    if (rest.sku !== undefined) patch.sku = rest.sku.trim() || undefined;
    if (rest.barcode !== undefined) patch.barcode = rest.barcode.trim() || undefined;
    await assertUniqueCodes(ctx, { sku: patch.sku, barcode: patch.barcode }, id);
    if (Object.keys(patch).length > 0) await ctx.db.patch(id, patch);

    // Stock edits use the same path as every other stock change, so the history stays complete.
    let qtyNow = current.stockQty;
    if (stockQty !== undefined) {
      if (!Number.isInteger(stockQty) || stockQty < 0) throw new Error('Stock must be a whole number, zero or more.');
      qtyNow = (await applyStockChange(ctx, id, stockQty - current.stockQty, 'Edited on the product page')) ?? stockQty;
    }
    if (inStock !== undefined) {
      if (inStock && qtyNow <= 0) throw new Error('Add stock before marking this product in stock.');
      await ctx.db.patch(id, { inStock });
    }
    // A copy (or archived product) that gets its first stock is put back on the storefront.
    if (current.unlisted && current.stockQty <= 0 && qtyNow > 0) await ctx.db.patch(id, { unlisted: false });
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
      unlisted: true, // an unfinished copy stays off the storefront until it is saved with stock
      stockQty: 0,
      sku: undefined,
      barcode: undefined,
    });
  },
});

export const archiveProduct = mutation({
  args: { token: v.string(), id: v.id('products') },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, MANAGERS);
    const { id } = args;
    // Hidden from the storefront whatever the stock; stock and history are kept.
    await ctx.db.patch(id, { unlisted: true });
  },
});

export const unarchiveProduct = mutation({
  args: { token: v.string(), id: v.id('products') },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, MANAGERS);
    const { id } = args;
    const p = await ctx.db.get(id);
    if (!p) throw new Error('Product not found');
    await ctx.db.patch(id, { unlisted: false });
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
    const p = await ctx.db.get(id);
    if (!p) throw new Error('Product not found');
    if (inStock && p.stockQty <= 0) throw new Error('Add stock before marking this product in stock.');
    await ctx.db.patch(id, { inStock });
  },
});
