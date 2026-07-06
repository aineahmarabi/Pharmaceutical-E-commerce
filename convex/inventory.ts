import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const listInventory = query({
  args: {
    search: v.optional(v.string()),
    category: v.optional(v.string()),
    stockStatus: v.optional(v.union(v.literal('inStock'), v.literal('lowStock'), v.literal('outOfStock'))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query('products');
    if (args.category) {
      q = ctx.db.query('products').withIndex('by_category', (idx) => idx.eq('categorySlug', args.category!)) as any;
    }
    
    let results = await q.collect();

    if (args.search) {
      const s = args.search.toLowerCase();
      results = results.filter(r => r.name.toLowerCase().includes(s) || r.slug.includes(s));
    }

    if (args.stockStatus === 'inStock') {
      results = results.filter(r => r.stockQty > 10);
    } else if (args.stockStatus === 'lowStock') {
      results = results.filter(r => r.stockQty > 0 && r.stockQty <= 10);
    } else if (args.stockStatus === 'outOfStock') {
      results = results.filter(r => r.stockQty <= 0);
    }

    // Sort by lowest stock first
    results.sort((a, b) => a.stockQty - b.stockQty);

    return results.slice(0, args.limit || 100);
  },
});

export const adjustStock = mutation({
  args: {
    productId: v.id('products'),
    variantId: v.optional(v.string()),
    changeAmount: v.number(),
    reason: v.string(),
    actorId: v.optional(v.id('staff')),
  },
  handler: async (ctx, { productId, variantId, changeAmount, reason, actorId }) => {
    const product = await ctx.db.get(productId);
    if (!product) throw new Error('Product not found');

    const newStock = product.stockQty + changeAmount;
    await ctx.db.patch(productId, {
      stockQty: newStock,
      inStock: newStock > 0,
    });

    await ctx.db.insert('inventoryLog', {
      productId,
      variantId,
      changeAmount,
      reason,
      actorId,
      createdAt: Date.now(),
    });
  },
});

export const getLowStockAlerts = query({
  args: { threshold: v.optional(v.number()) },
  handler: async (ctx, { threshold = 10 }) => {
    const products = await ctx.db.query('products').collect();
    return products.filter((p) => p.stockQty <= threshold);
  },
});

export const getInventoryHistory = query({
  args: { productId: v.id('products') },
  handler: async (ctx, { productId }) => {
    return await ctx.db.query('inventoryLog')
      .withIndex('by_product', q => q.eq('productId', productId))
      .order('desc')
      .collect();
  },
});
