import type { QueryCtx, MutationCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';

/**
 * Server-side check for every admin-only Convex function.
 *
 * The admin screens are hidden behind a login in the browser, but the browser is not a
 * security boundary: anyone can call a public Convex function directly. So each admin
 * function must take `token: v.string()` and begin with `await requireStaff(ctx, args.token, ...)`.
 *
 * Roles mirror src/lib/permissions.ts:
 *   super_admin  the owner (passcode login), can do everything
 *   admin        staff manager
 *   pharmacist   POS, orders, inventory and prescriptions
 */
export type StaffRole = 'super_admin' | 'admin' | 'pharmacist';

export const ANY_STAFF: StaffRole[] = ['super_admin', 'admin', 'pharmacist'];
export const MANAGERS: StaffRole[] = ['super_admin', 'admin'];
export const OWNER_ONLY: StaffRole[] = ['super_admin'];

export interface StaffIdentity {
  role: StaffRole;
  staffId: Id<'staff'> | null;
  name: string;
}

export async function requireStaff(
  ctx: QueryCtx | MutationCtx,
  token: string,
  allowed: StaffRole[] = ANY_STAFF,
): Promise<StaffIdentity> {
  // One generic message for every failure, so callers learn nothing about why.
  const denied = () => new Error('Not authorized.');

  if (!token || token.length > 200) throw denied();

  const session = await ctx.db
    .query('adminSessions')
    .withIndex('by_token', (q) => q.eq('token', token))
    .first();
  if (!session || session.expiresAt < Date.now()) throw denied();

  let identity: StaffIdentity;
  if (!session.staffId) {
    identity = { role: 'super_admin', staffId: null, name: 'Owner' };
  } else {
    const staff = await ctx.db.get(session.staffId);
    if (!staff || !staff.active) throw denied();
    identity = { role: staff.role as StaffRole, staffId: staff._id, name: staff.name };
  }

  if (!allowed.includes(identity.role)) throw denied();
  return identity;
}
