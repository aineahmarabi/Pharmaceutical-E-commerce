import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { clearFailures, lockedForMs, recordFailure, safeEqual, secureToken } from './throttle';

// First-ever login only: the starting passcode comes from the ADMIN_BOOTSTRAP_PASSCODE environment variable, never from
// source code (this repository is public). With no variable and no saved passcode, owner login stays closed.
const bootstrapPasscode = () => process.env.ADMIN_BOOTSTRAP_PASSCODE ?? '';

const toHex = (buf: ArrayBuffer | Uint8Array) => Array.from(new Uint8Array(buf as ArrayBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');

/** Older records: plain SHA-256. Only used to verify, then upgraded on the next successful login. */
async function legacyHash(passcode: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(passcode)));
}

/** Salted, slow hash: a copy of the database cannot be used to guess a short passcode quickly. */
async function slowHash(passcode: string, saltHex: string): Promise<string> {
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((h) => parseInt(h, 16)));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(passcode), 'PBKDF2', false, ['deriveBits']);
  return toHex(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt as BufferSource, iterations: 100_000, hash: 'SHA-256' }, key, 256));
}

const newSalt = () => toHex(crypto.getRandomValues(new Uint8Array(16)));

async function matches(security: { passcodeHash: string; passcodeSalt?: string }, passcode: string): Promise<boolean> {
  return security.passcodeSalt
    ? safeEqual(security.passcodeHash, await slowHash(passcode, security.passcodeSalt))
    : safeEqual(security.passcodeHash, await legacyHash(passcode));
}

export const validateSession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('adminSessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();

    if (!session) return false;
    if (session.expiresAt < Date.now()) {
      return false;
    }
    return true;
  },
});

export const getSessionInfo = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query('adminSessions')
      .withIndex('by_token', (q) => q.eq('token', token))
      .first();

    if (!session || session.expiresAt < Date.now()) return null;

    if (!session.staffId) {
      return { role: 'super_admin' as const, name: 'Owner', staffId: null };
    }

    const staff = await ctx.db.get(session.staffId);
    if (!staff || !staff.active) return null;

    return { role: staff.role, name: staff.name, staffId: staff._id };
  },
});

export const login = mutation({
  args: { passcode: v.string() },
  handler: async (ctx, args) => {
    if (args.passcode.length > 64) return { success: false, error: 'Invalid passcode' };

    // Lock the owner login after repeated failures (a short passcode is guessable).
    if ((await lockedForMs(ctx, 'admin-passcode')) > 0) {
      return { success: false, error: 'Too many failed attempts. Please wait 15 minutes and try again.' };
    }

    const security = await ctx.db.query('adminSecurity').first();
    const bootstrap = bootstrapPasscode();
    const isValid = security ? await matches(security, args.passcode) : bootstrap !== '' && safeEqual(args.passcode, bootstrap);

    if (!isValid) {
      await recordFailure(ctx, 'admin-passcode', 5);
      if (security) {
        await ctx.db.patch(security._id, {
          failedAttempts: security.failedAttempts + 1,
          lastFailedAt: Date.now(),
        });
      }
      return { success: false, error: 'Invalid passcode' };
    }
    await clearFailures(ctx, 'admin-passcode');

    // First successful login with the default passcode seeds the security row
    // so changePasscode has something real to update going forward.
    if (!security) {
      const salt = newSalt();
      await ctx.db.insert('adminSecurity', {
        passcodeHash: await slowHash(args.passcode, salt),
        passcodeSalt: salt,
        failedAttempts: 0,
        updatedAt: Date.now(),
      });
    } else if (!security.passcodeSalt) {
      // Quietly move an older plain-SHA-256 record to the salted format now that the real passcode is in hand.
      const salt = newSalt();
      await ctx.db.patch(security._id, { passcodeHash: await slowHash(args.passcode, salt), passcodeSalt: salt });
    }

    const token = secureToken();

    await ctx.db.insert('adminSessions', {
      token,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    return { success: true, token };
  },
});

export const changePasscode = mutation({
  args: { token: v.string(), currentPasscode: v.string(), newPasscode: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('adminSessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      return { success: false, error: 'Session expired. Please log in again.' };
    }

    // Only the owner (a passcode session, not bound to a staff member) may change the passcode.
    if (session.staffId) {
      return { success: false, error: 'Only the owner can change the passcode.' };
    }

    if (args.newPasscode.length < 4) {
      return { success: false, error: 'Passcode must be at least 4 characters.' };
    }

    if ((await lockedForMs(ctx, 'admin-passcode')) > 0) {
      return { success: false, error: 'Too many failed attempts. Please wait 15 minutes and try again.' };
    }

    const security = await ctx.db.query('adminSecurity').first();
    const bootstrap = bootstrapPasscode();
    const isCurrentValid = security ? await matches(security, args.currentPasscode) : bootstrap !== '' && safeEqual(args.currentPasscode, bootstrap);

    if (!isCurrentValid) {
      await recordFailure(ctx, 'admin-passcode', 5);
      return { success: false, error: 'Current passcode is incorrect.' };
    }

    const salt = newSalt();
    const newHash = await slowHash(args.newPasscode, salt);
    if (security) {
      await ctx.db.patch(security._id, { passcodeHash: newHash, passcodeSalt: salt, updatedAt: Date.now() });
    } else {
      await ctx.db.insert('adminSecurity', { passcodeHash: newHash, passcodeSalt: salt, failedAttempts: 0, updatedAt: Date.now() });
    }

    return { success: true };
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('adminSessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }
    return { success: true };
  },
});
