import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const listStaff = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('staff').order('desc').collect();
  },
});

export const getStaffById = query({
  args: { id: v.id('staff') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const addStaffMember = mutation({
  args: {
    name: v.string(),
    role: v.union(v.literal('super_admin'), v.literal('admin'), v.literal('pharmacist'), v.literal('support')),
    email: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('staff', {
      ...args,
      active: true,
      createdAt: Date.now(),
    });
  },
});

export const updateStaffRole = mutation({
  args: {
    id: v.id('staff'),
    role: v.union(v.literal('super_admin'), v.literal('admin'), v.literal('pharmacist'), v.literal('support')),
  },
  handler: async (ctx, { id, role }) => {
    await ctx.db.patch(id, { role });
  },
});

export const deactivateStaff = mutation({
  args: { id: v.id('staff') },
  handler: async (ctx, { id }) => {
    // Soft delete to preserve audit logs
    await ctx.db.patch(id, { active: false });
  },
});
