import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { requireStaff, ANY_STAFF } from './adminGuard';
import { lockedForMs, recordFailure } from './throttle';

/** Admin image uploads (products, brands, categories, logo). Staff only. */
export const generateUploadUrl = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, ANY_STAFF);
    return await ctx.storage.generateUploadUrl();
  },
});

/** Public storefront prescription upload; globally rate limited. */
export const generatePrescriptionUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    if ((await lockedForMs(ctx, 'rx-upload:global')) > 0) throw new Error('Too many uploads right now. Please try again later.');
    await recordFailure(ctx, 'rx-upload:global', 60);
    return await ctx.storage.generateUploadUrl();
  },
});
