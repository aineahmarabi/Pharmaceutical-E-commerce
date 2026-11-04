import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireStaff, ANY_STAFF } from './adminGuard';
import type { MutationCtx, QueryCtx } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';

export const DEFAULT_LOW_STOCK_THRESHOLD = 10;

export async function getLowStockThreshold(ctx: { db: QueryCtx['db'] }): Promise<number> {
  const row = await ctx.db.query('storeSettings').withIndex('by_key', (q) => q.eq('key', 'lowStockThreshold')).first();
  const n = row?.value === null || row?.value === undefined || row?.value === '' ? NaN : Number(row.value);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_LOW_STOCK_THRESHOLD;
}

/**
 * Create a single 'low_stock' notification when stock crosses down to or below the
 * threshold (or hits zero). Fires only on the crossing, so it will not repeat until the
 * product has been restocked above the threshold. Restocking clears unread alerts.
 */
export async function syncLowStockNotification(
  ctx: { db: MutationCtx['db'] },
  product: Pick<Doc<'products'>, '_id' | 'name'>,
  prevQty: number,
  newQty: number,
) {
  const threshold = await getLowStockThreshold(ctx);
  if (newQty > threshold) {
    if (prevQty <= threshold) {
      const unread = await ctx.db.query('notifications').withIndex('by_read', (q) => q.eq('read', false)).collect();
      for (const n of unread) {
        if (n.type === 'low_stock' && n.targetId === product._id) await ctx.db.patch(n._id, { read: true });
      }
    }
    return;
  }
  const crossed = prevQty > threshold || (newQty <= 0 && prevQty > 0);
  if (!crossed) return;
  await ctx.db.insert('notifications', {
    type: 'low_stock',
    title: newQty <= 0 ? 'Out of stock' : 'Low stock warning',
    message: `${product.name} has ${Math.max(0, newQty)} unit(s) left`,
    targetId: product._id,
    read: false,
    createdAt: Date.now(),
  });
}

export const listInventory = query({
  args: {
    token: v.string(),
    search: v.optional(v.string()),
    category: v.optional(v.string()),
    stockStatus: v.optional(v.union(v.literal('inStock'), v.literal('lowStock'), v.literal('outOfStock'))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, ANY_STAFF);
    const q = args.category
      ? ctx.db.query('products').withIndex('by_category', (idx) => idx.eq('categorySlug', args.category!))
      : ctx.db.query('products');

    let results = await q.collect();
    const threshold = await getLowStockThreshold(ctx);

    if (args.search) {
      const s = args.search.toLowerCase();
      results = results.filter(r => r.name.toLowerCase().includes(s) || r.slug.includes(s));
    }

    if (args.stockStatus === 'inStock') {
      results = results.filter(r => r.stockQty > threshold);
    } else if (args.stockStatus === 'lowStock') {
      results = results.filter(r => r.stockQty > 0 && r.stockQty <= threshold);
    } else if (args.stockStatus === 'outOfStock') {
      results = results.filter(r => r.stockQty <= 0);
    }

    // Sort by lowest stock first
    results.sort((a, b) => a.stockQty - b.stockQty);

    return results.slice(0, args.limit || 100);
  },
});

/**
 * The one safe way to change a product's stock: updates the count, keeps the in-stock flag
 * in step with it, writes the history line and raises or clears the low-stock alert.
 * The count never goes below zero. Returns the new count, or null if the product no longer exists.
 */
export async function applyStockChange(
  ctx: { db: MutationCtx['db'] },
  productId: Id<'products'>,
  delta: number,
  reason: string,
  actorId?: Id<'staff'>,
): Promise<number | null> {
  const product = await ctx.db.get(productId);
  if (!product) return null;
  const newQty = Math.max(0, product.stockQty + delta);
  const actual = newQty - product.stockQty;
  if (actual === 0) return product.stockQty;
  await ctx.db.patch(productId, { stockQty: newQty, inStock: newQty > 0 });
  await ctx.db.insert('inventoryLog', { productId, changeAmount: actual, reason, actorId, createdAt: Date.now() });
  await syncLowStockNotification(ctx, product, product.stockQty, newQty);
  return newQty;
}

export const adjustStock = mutation({
  args: {
    token: v.string(),
    productId: v.id('products'),
    variantId: v.optional(v.string()),
    changeAmount: v.number(),
    reason: v.string(),
    actorId: v.optional(v.id('staff')),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, ANY_STAFF);
    const { productId, variantId, changeAmount, reason, actorId } = args;
    const product = await ctx.db.get(productId);
    if (!product) throw new Error('Product not found');

    if (!Number.isFinite(changeAmount) || !Number.isInteger(changeAmount) || changeAmount === 0) {
      throw new Error('Enter a whole number of units to add or remove.');
    }
    const newStock = product.stockQty + changeAmount;
    if (newStock < 0) throw new Error(`Only ${product.stockQty} unit(s) in stock, so that many cannot be removed.`);
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

    await syncLowStockNotification(ctx, product, product.stockQty, newStock);
  },
});

export const getLowStockAlerts = query({
  args: {
    token: v.string(), threshold: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, ANY_STAFF);
    const { threshold: given } = args;
    let threshold = given;
    if (threshold === undefined) {
      const row = await ctx.db.query('storeSettings').withIndex('by_key', (q) => q.eq('key', 'lowStockThreshold')).first();
      const n = row?.value === null || row?.value === undefined || row?.value === '' ? NaN : Number(row.value);
      threshold = Number.isFinite(n) && n >= 0 ? n : DEFAULT_LOW_STOCK_THRESHOLD;
    }
    const products = await ctx.db.query('products').collect();
    return products.filter((p) => p.stockQty <= threshold);
  },
});

export const getInventoryHistory = query({
  args: {
    token: v.string(), productId: v.id('products') },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, ANY_STAFF);
    const { productId } = args;
    return await ctx.db.query('inventoryLog')
      .withIndex('by_product', q => q.eq('productId', productId))
      .order('desc')
      .collect();
  },
});
