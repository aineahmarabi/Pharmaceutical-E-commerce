import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { lockedForMs, recordFailure } from './throttle';

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
    if (!Number.isInteger(args.rating) || args.rating < 1 || args.rating > 5) {
      throw new Error('Rating must be a whole number between 1 and 5');
    }
    const name = args.customerName.trim();
    const comment = args.comment?.trim();
    if (name.length > 80) throw new Error('Name must be 80 characters or fewer.');
    if (comment && comment.length > 1000) throw new Error('Review must be 1000 characters or fewer.');
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error('Product not found.');

    const key = `review:${args.productId}`;
    if ((await lockedForMs(ctx, key)) > 0) {
      throw new Error('This product is receiving many reviews right now. Please try again later.');
    }
    await recordFailure(ctx, key, 8);

    await ctx.db.insert('reviews', {
      productId: args.productId,
      customerName: name || 'Anonymous',
      rating: args.rating,
      comment: comment || undefined,
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
