import { requireStaff, MANAGERS } from './adminGuard';
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('brands').collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query('brands')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .first();
  },
});

export const create = mutation({
  args: { token: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, MANAGERS);
    return await ctx.db.insert('brands', {
      name: args.name,
      slug: args.slug,
      description: args.description,
      imageUrl: args.imageUrl,
      imageStorageId: args.imageStorageId,
      productCount: 0,
    });
  },
});

export const update = mutation({
  args: { token: v.string(),
    id: v.id('brands'),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, MANAGERS);
    const { id, token: _token, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const remove = mutation({
  args: { token: v.string(), id: v.id('brands') },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, MANAGERS);
    const { id } = args;
    await ctx.db.delete(id);
    return id;
  },
});
