import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const listByProduct = query({
  args: { productId: v.id('products') },
  handler: async (ctx, { productId }) => {
    return await ctx.db
      .query('reviews')
      .withIndex('by_product', (q) => q.eq('productId', productId))
      .order('desc')
      .collect();
  },
});

export const submitReview = mutation({
  args: {
    productId: v.id('products'),
    customerName: v.string(),
    rating: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.rating < 1 || args.rating > 5) throw new Error('Rating must be between 1 and 5');

    await ctx.db.insert('reviews', {
      productId: args.productId,
      customerName: args.customerName.trim() || 'Anonymous',
      rating: args.rating,
      comment: args.comment?.trim() || undefined,
      createdAt: Date.now(),
    });

    const allReviews = await ctx.db
      .query('reviews')
      .withIndex('by_product', (q) => q.eq('productId', args.productId))
      .collect();

    const reviewCount = allReviews.length;
    const rating = allReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;

    await ctx.db.patch(args.productId, { rating, reviewCount });
  },
});
