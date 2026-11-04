import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireStaff, ANY_STAFF } from './adminGuard';

const PHONE_RE = /^[0-9+()\s-]{7,}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FILES = 5;
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const statusValidator = v.union(
  v.literal('pending'),
  v.literal('approved'),
  v.literal('rejected'),
  v.literal('needs_info'),
);

function normPhone(p: string) {
  return p.replace(/[^0-9]/g, '');
}

export const submit = mutation({
  args: {
    customerName: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
    fileIds: v.array(v.id('_storage')),
    fulfillment: v.optional(v.union(v.literal('delivery'), v.literal('pickup'))),
    deliveryZoneId: v.optional(v.id('deliveryZones')),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const name = args.customerName.trim();
    const phone = args.phone.trim();
    const email = args.email?.trim() || undefined;
    const notes = args.notes?.trim() || undefined;

    if (name.length < 2 || name.length > 100) throw new Error('Enter your name.');
    if (!PHONE_RE.test(phone) || phone.length > 20) throw new Error('Enter a valid phone number.');
    if (email && (!EMAIL_RE.test(email) || email.length > 200)) throw new Error('Enter a valid email.');
    if (notes && notes.length > 1000) throw new Error('Notes are too long.');
    if (args.fileIds.length < 1 || args.fileIds.length > MAX_FILES) {
      throw new Error('Attach between 1 and 5 files.');
    }
    if (new Set(args.fileIds).size !== args.fileIds.length) throw new Error('Duplicate files.');

    // Delivery needs an active area and an address; pickup needs nothing more.
    let deliveryZoneId: typeof args.deliveryZoneId = undefined;
    let deliveryArea: string | undefined;
    let address: string | undefined;
    if (args.fulfillment === 'delivery') {
      const zone = args.deliveryZoneId ? await ctx.db.get(args.deliveryZoneId) : null;
      if (!zone || !zone.isActive) throw new Error('Choose a delivery area.');
      address = args.address?.trim() || undefined;
      if (!address || address.length < 5 || address.length > 300) throw new Error('Enter your street address or landmark.');
      deliveryZoneId = zone._id;
      deliveryArea = zone.name;
    }

    for (const id of args.fileIds) {
      const meta = await ctx.db.system.get(id);
      if (!meta) throw new Error('A file upload was not found. Please try again.');
      if (meta.size > MAX_BYTES) throw new Error('Each file must be 8 MB or smaller.');
      if (!meta.contentType || !ALLOWED_TYPES.includes(meta.contentType)) {
        throw new Error('Only JPG, PNG, WebP or PDF files are accepted.');
      }
    }

    // Sequential reference: RX-1001, RX-1002, ...
    const last = await ctx.db.query('prescriptions').order('desc').first();
    const lastNum = last ? parseInt(last.reference.replace(/[^0-9]/g, ''), 10) : 1000;
    const reference = `RX-${(Number.isFinite(lastNum) ? lastNum : 1000) + 1}`;

    const now = Date.now();
    await ctx.db.insert('prescriptions', {
      reference,
      customerName: name,
      phone,
      email,
      notes,
      fulfillment: args.fulfillment,
      deliveryZoneId,
      deliveryArea,
      address,
      fileIds: args.fileIds,
      status: 'pending',
      createdAt: now,
    });

    await ctx.db.insert('notifications', {
      type: 'prescription_approval',
      title: 'New prescription',
      message: `${reference} from ${name}`,
      targetId: reference,
      read: false,
      createdAt: now,
    });

    return { reference };
  },
});

// Public: reference AND phone must both match. Never returns file URLs.
export const status = query({
  args: { reference: v.string(), phone: v.string() },
  handler: async (ctx, args) => {
    const ref = args.reference.trim().toUpperCase();
    const rx = await ctx.db
      .query('prescriptions')
      .withIndex('by_reference', (q) => q.eq('reference', ref))
      .first();
    const digits = normPhone(args.phone);
    if (!rx || digits.length < 7 || normPhone(rx.phone) !== digits) return null;
    return {
      reference: rx.reference,
      status: rx.status,
      pharmacistNote: rx.pharmacistNote ?? null,
      createdAt: rx.createdAt,
    };
  },
});

export const list = query({
  args: { token: v.string(), status: v.optional(statusValidator) },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, ANY_STAFF);
    const rows = args.status
      ? await ctx.db
          .query('prescriptions')
          .withIndex('by_status', (q) => q.eq('status', args.status!))
          .order('desc')
          .take(500)
      : await ctx.db.query('prescriptions').order('desc').take(500);
    return rows.map((r) => ({
      _id: r._id,
      reference: r.reference,
      customerName: r.customerName,
      phone: r.phone,
      status: r.status,
      fileCount: r.fileIds.length,
      createdAt: r.createdAt,
    }));
  },
});

export const get = query({
  args: { token: v.string(), id: v.id('prescriptions') },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, ANY_STAFF);
    const rx = await ctx.db.get(args.id);
    if (!rx) return null;
    const files = await Promise.all(
      rx.fileIds.map(async (id) => {
        const meta = await ctx.db.system.get(id);
        return {
          id,
          url: await ctx.storage.getUrl(id),
          contentType: meta?.contentType ?? null,
          size: meta?.size ?? 0,
        };
      }),
    );
    return { ...rx, files };
  },
});

export const updateStatus = mutation({
  args: {
    token: v.string(),
    id: v.id('prescriptions'),
    status: statusValidator,
    pharmacistNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await requireStaff(ctx, args.token, ANY_STAFF);
    const rx = await ctx.db.get(args.id);
    if (!rx) throw new Error('Prescription not found.');
    const note = args.pharmacistNote?.trim() || undefined;
    if ((args.status === 'rejected' || args.status === 'needs_info') && !note) {
      throw new Error('A note for the customer is required.');
    }
    if (note && note.length > 1000) throw new Error('Note is too long.');
    await ctx.db.patch(args.id, {
      status: args.status,
      pharmacistNote: note,
      reviewedAt: Date.now(),
      reviewedBy: actor.name,
    });
  },
});
