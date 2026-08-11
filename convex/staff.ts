import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

const roleValidator = v.union(v.literal('super_admin'), v.literal('admin'), v.literal('pharmacist'));

async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

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
    role: roleValidator,
    email: v.string(),
    phone: v.optional(v.string()),
    pin: v.string(),
  },
  handler: async (ctx, { pin, ...args }) => {
    if (!/^\d{4}$/.test(pin)) {
      throw new Error('PIN must be exactly 4 digits');
    }
    const pinHash = await hashPin(pin);
    const activeStaff = await ctx.db.query('staff').filter((q) => q.eq(q.field('active'), true)).collect();
    if (activeStaff.some((s) => s.pinHash === pinHash)) {
      throw new Error('That PIN is already in use by another staff member');
    }

    await ctx.db.insert('staff', {
      ...args,
      pinHash,
      active: true,
      createdAt: Date.now(),
    });
  },
});

export const resetStaffPin = mutation({
  args: { id: v.id('staff'), pin: v.string() },
  handler: async (ctx, { id, pin }) => {
    if (!/^\d{4}$/.test(pin)) {
      throw new Error('PIN must be exactly 4 digits');
    }
    const pinHash = await hashPin(pin);
    const activeStaff = await ctx.db.query('staff').filter((q) => q.eq(q.field('active'), true)).collect();
    if (activeStaff.some((s) => s._id !== id && s.pinHash === pinHash)) {
      throw new Error('That PIN is already in use by another staff member');
    }
    await ctx.db.patch(id, { pinHash });
  },
});

export const updateStaffRole = mutation({
  args: {
    id: v.id('staff'),
    role: roleValidator,
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

export const loginWithPin = mutation({
  args: { pin: v.string() },
  handler: async (ctx, { pin }) => {
    if (!/^\d{4}$/.test(pin)) {
      return { success: false, error: 'Invalid PIN' };
    }
    const pinHash = await hashPin(pin);
    const staff = await ctx.db
      .query('staff')
      .filter((q) => q.and(q.eq(q.field('pinHash'), pinHash), q.eq(q.field('active'), true)))
      .first();

    if (!staff) {
      return { success: false, error: 'Incorrect PIN' };
    }

    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    await ctx.db.insert('adminSessions', {
      staffId: staff._id,
      token,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    return { success: true, token, role: staff.role };
  },
});
