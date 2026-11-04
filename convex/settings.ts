import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireStaff, MANAGERS } from './adminGuard';

// Only these keys are readable without a token (storefront header/footer/about, favicon,
// admin display name). Any other key stored in storeSettings stays private.
const PUBLIC_KEYS = new Set([
  'name',
  'tagline',
  'logo',
  'phone',
  'email',
  'whatsapp',
  'address',
  'mapLink',
  'socialLinks',
  'currency',
  'adminDisplayName',
  'pharmacistName',
  'ppbLicenceNumber',
  'ppbLicenceExpiry',
  'lowStockThreshold',
  'showOutOfStock',
]);

export const getStoreSettings = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('storeSettings').collect();
    return rows.filter((r) => PUBLIC_KEYS.has(r.key));
  },
});

export const getStoreSetting = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    if (!PUBLIC_KEYS.has(key)) return null;
    return await ctx.db.query('storeSettings')
      .withIndex('by_key', q => q.eq('key', key))
      .first();
  },
});

export const updateStoreSetting = mutation({
  args: { token: v.string(), key: v.string(), value: v.any() },
  handler: async (ctx, { token, key, value }) => {
    await requireStaff(ctx, token, MANAGERS);
    const existing = await ctx.db.query('storeSettings')
      .withIndex('by_key', q => q.eq('key', key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { value });
    } else {
      await ctx.db.insert('storeSettings', { key, value });
    }
  },
});

export const updateLogo = mutation({
  args: { token: v.string(), storageId: v.id('_storage') },
  handler: async (ctx, { token, storageId }) => {
    await requireStaff(ctx, token, MANAGERS);
    const url = await ctx.storage.getUrl(storageId);
    const existing = await ctx.db.query('storeSettings')
      .withIndex('by_key', q => q.eq('key', 'logo'))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { value: url });
    } else {
      await ctx.db.insert('storeSettings', { key: 'logo', value: url });
    }
    return url;
  },
});
