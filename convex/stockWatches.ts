import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import type { Doc } from './_generated/dataModel';
import { requireCustomerId } from './customerAuth';

/** Fields the storefront needs to announce a product; nothing private. */
function summary(p: Doc<'products'>) {
  return { productId: p._id, slug: p.slug, name: p.name, inStock: p.inStock && p.stockQty > 0 && p.unlisted !== true };
}

/** A signed-in customer asks to be told when a product is back. Safe to repeat. */
export const watch = mutation({
  args: { token: v.string(), productId: v.id('products') },
  handler: async (ctx, { token, productId }) => {
    const customerId = await requireCustomerId(ctx, token);
    const existing = await ctx.db
      .query('stockWatches')
      .withIndex('by_customer_product', (q) => q.eq('customerId', customerId).eq('productId', productId))
      .first();
    if (existing) return;
    if (!(await ctx.db.get(productId))) throw new Error('Product not found');
    await ctx.db.insert('stockWatches', { customerId, productId, createdAt: Date.now() });
  },
});

export const unwatch = mutation({
  args: { token: v.string(), productId: v.id('products') },
  handler: async (ctx, { token, productId }) => {
    const customerId = await requireCustomerId(ctx, token);
    const rows = await ctx.db
      .query('stockWatches')
      .withIndex('by_customer_product', (q) => q.eq('customerId', customerId).eq('productId', productId))
      .collect();
    for (const r of rows) await ctx.db.delete(r._id);
  },
});

/** Products the signed-in customer is waiting for, with their current availability. */
export const myWatches = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    let customerId;
    try {
      customerId = await requireCustomerId(ctx, token);
    } catch {
      return [];
    }
    const rows = await ctx.db.query('stockWatches').withIndex('by_customer', (q) => q.eq('customerId', customerId)).take(50);
    const out = [];
    for (const r of rows) {
      const p = await ctx.db.get(r.productId);
      if (p) out.push(summary(p));
    }
    return out;
  },
});

/** Availability of products a guest's device is waiting for. The ids come from that device's own memory. */
export const statusForIds = query({
  args: { ids: v.array(v.string()) },
  handler: async (ctx, { ids }) => {
    const out = [];
    for (const raw of ids.slice(0, 30)) {
      const id = ctx.db.normalizeId('products', raw);
      if (!id) continue;
      const p = await ctx.db.get(id);
      if (p) out.push(summary(p));
    }
    return out;
  },
});
