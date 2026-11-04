import { clearFailures, lockedForMs, recordFailure, secureToken } from './throttle';
import { query, mutation } from './_generated/server';
import type { MutationCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';
import { v } from 'convex/values';
import { requireStaff, OWNER_ONLY } from './adminGuard';

// New assignments are 'admin' or 'pharmacist'. 'super_admin' still exists on older records and is treated as admin.
const roleValidator = v.union(v.literal('admin'), v.literal('pharmacist'));

async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function assertNotLastAdmin(ctx: MutationCtx, id: Id<'staff'>) {
  const all = await ctx.db.query('staff').collect();
  const others = all.filter((s) => s._id !== id && s.active && (s.role === 'super_admin' || s.role === 'admin'));
  if (others.length === 0) throw new Error('You cannot remove or demote the last active admin.');
}

export const listStaff = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireStaff(ctx, token, OWNER_ONLY);
    const rows = await ctx.db.query('staff').order('desc').collect();
    // Never send PIN hashes to the browser.
    return rows.map(({ pinHash: _pinHash, ...rest }) => rest);
  },
});

export const getStaffById = query({
  args: { token: v.string(), id: v.id('staff') },
  handler: async (ctx, { token, id }) => {
    await requireStaff(ctx, token, OWNER_ONLY);
    const row = await ctx.db.get(id);
    if (!row) return null;
    const { pinHash: _pinHash, ...rest } = row;
    return rest;
  },
});

export const addStaffMember = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    role: roleValidator,
    email: v.string(),
    phone: v.optional(v.string()),
    pin: v.string(),
  },
  handler: async (ctx, { pin, token, ...args }) => {
    await requireStaff(ctx, token, OWNER_ONLY);
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
  args: { token: v.string(), id: v.id('staff'), pin: v.string() },
  handler: async (ctx, { token, id, pin }) => {
    await requireStaff(ctx, token, OWNER_ONLY);
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
    token: v.string(),
    id: v.id('staff'),
    role: roleValidator,
  },
  handler: async (ctx, { token, id, role }) => {
    await requireStaff(ctx, token, OWNER_ONLY);
    const target = await ctx.db.get(id);
    if (target && target.active && (target.role === 'super_admin' || target.role === 'admin') && role === 'pharmacist') {
      await assertNotLastAdmin(ctx, id);
    }
    await ctx.db.patch(id, { role });
  },
});

export const deactivateStaff = mutation({
  args: { token: v.string(), id: v.id('staff') },
  handler: async (ctx, { token, id }) => {
    await requireStaff(ctx, token, OWNER_ONLY);
    const target = await ctx.db.get(id);
    if (target && target.active && (target.role === 'super_admin' || target.role === 'admin')) {
      await assertNotLastAdmin(ctx, id);
    }
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
    // A 4-digit PIN has only 10,000 combinations, so repeated failures lock this login.
    if ((await lockedForMs(ctx, 'staff-pin')) > 0) {
      return { success: false, error: 'Too many failed attempts. Please wait 15 minutes and try again.' };
    }
    const pinHash = await hashPin(pin);
    const staff = await ctx.db
      .query('staff')
      .filter((q) => q.and(q.eq(q.field('pinHash'), pinHash), q.eq(q.field('active'), true)))
      .first();

    if (!staff) {
      await recordFailure(ctx, 'staff-pin', 8);
      return { success: false, error: 'Incorrect PIN' };
    }
    await clearFailures(ctx, 'staff-pin');

    const token = secureToken();
    await ctx.db.insert('adminSessions', {
      staffId: staff._id,
      token,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    return { success: true, token, role: staff.role };
  },
});
