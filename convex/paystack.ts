import { action, internalAction, internalMutation, internalQuery, query } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';
import { applyStockChange } from './inventory';

/**
 * Paystack online payment (M-PESA and cards, on Paystack's own secure page).
 *
 * Needs one server-side secret, set once with:  npx convex env set PAYSTACK_SECRET_KEY sk_...
 * The secret never reaches the browser. The amount to charge always comes from the order in the
 * database, never from the browser, and every payment is checked against the order before it counts.
 */
const API = 'https://api.paystack.co';
const digitsOf = (s: string) => s.replace(/\D/g, '');

type VerifyState = 'paid' | 'pending' | 'failed' | 'mismatch' | 'unknown';
interface PaystackJson {
  status?: boolean;
  message?: string;
  data?: { authorization_url?: string; status?: string; amount?: number; currency?: string; channel?: string };
}

/** True when online payment has been set up. Lets checkout show or hide the option. */
export const isConfigured = query({
  args: {},
  handler: async () => Boolean(process.env.PAYSTACK_SECRET_KEY),
});

export const loadForPayment = internalQuery({
  args: { orderId: v.id('orders'), phone: v.string() },
  handler: async (ctx, { orderId, phone }) => {
    const o = await ctx.db.get(orderId);
    if (!o || o.paymentMethod !== 'paystack' || o.status === 'cancelled') return null;
    // The order id is unguessable, and the phone number must match too.
    if (digitsOf(o.customerPhone) !== digitsOf(phone)) return null;
    if (o.paymentStatus === 'paid') return { alreadyPaid: true as const, orderNumber: o.orderNumber };
    return { alreadyPaid: false as const, orderNumber: o.orderNumber, total: o.total, email: o.customerEmail };
  },
});

export const attachReference = internalMutation({
  args: { orderId: v.id('orders'), reference: v.string() },
  handler: async (ctx, { orderId, reference }) => {
    await ctx.db.patch(orderId, { paymentRef: reference });
  },
});

/** Step 1: create the Paystack payment for an order and return the address to send the customer to. */
export const startPayment = action({
  args: { orderId: v.id('orders'), phone: v.string(), callbackUrl: v.string() },
  handler: async (ctx, args): Promise<{ url: string; reference: string }> => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error('Online payment is not set up yet.');

    let callback: URL;
    try {
      callback = new URL(args.callbackUrl);
    } catch {
      throw new Error('Invalid return address.');
    }
    if (!/^https?:$/.test(callback.protocol) || !callback.pathname.endsWith('/checkout/complete')) {
      throw new Error('Invalid return address.');
    }

    const order = await ctx.runQuery(internal.paystack.loadForPayment, { orderId: args.orderId, phone: args.phone });
    if (!order) throw new Error('We could not find that order.');
    if (order.alreadyPaid) throw new Error('This order is already paid.');

    const reference = `${order.orderNumber.replace(/[^A-Za-z0-9]/g, '')}-${Date.now().toString(36)}`;
    const res = await fetch(`${API}/transaction/initialize`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: order.email,
        amount: Math.round(order.total * 100), // Paystack counts in the smallest unit (cents)
        currency: 'KES',
        reference,
        callback_url: callback.toString(),
        metadata: { orderId: args.orderId, orderNumber: order.orderNumber },
      }),
    });
    const json = (await res.json().catch(() => null)) as PaystackJson | null;
    if (!res.ok || !json?.status || !json.data?.authorization_url) {
      throw new Error(json?.message ?? 'Could not start the payment. Please try again.');
    }
    await ctx.runMutation(internal.paystack.attachReference, { orderId: args.orderId, reference });
    return { url: json.data.authorization_url, reference };
  },
});

/** Records a payment result against its order. Safe to call more than once (webhook and return page both do). */
export const applyVerification = internalMutation({
  args: {
    reference: v.string(),
    status: v.string(),
    amount: v.number(),
    currency: v.string(),
    channel: v.optional(v.string()),
  },
  handler: async (ctx, a): Promise<{ state: VerifyState; orderNumber?: string }> => {
    const order = await ctx.db.query('orders').withIndex('by_payment_ref', (q) => q.eq('paymentRef', a.reference)).first();
    if (!order) return { state: 'unknown' };
    const orderNumber = order.orderNumber;

    if (a.status !== 'success') {
      const failed = a.status === 'failed' || a.status === 'abandoned' || a.status === 'reversed';
      return { state: failed ? 'failed' : 'pending', orderNumber };
    }

    // Never trust a "success" for the wrong amount or currency.
    if (a.amount !== Math.round(order.total * 100) || a.currency !== 'KES') {
      await ctx.db.insert('auditLog', {
        action: 'PAYMENT_MISMATCH',
        targetType: 'order',
        targetId: order._id,
        metadata: { reference: a.reference, paid: a.amount, expected: Math.round(order.total * 100), currency: a.currency },
        createdAt: Date.now(),
      });
      return { state: 'mismatch', orderNumber };
    }

    if (order.paymentStatus === 'paid') return { state: 'paid', orderNumber };

    await ctx.db.patch(order._id, { paymentStatus: 'paid', paidAt: Date.now(), paymentChannel: a.channel });
    await ctx.db.insert('auditLog', {
      action: 'PAYMENT_CAPTURED',
      targetType: 'order',
      targetId: order._id,
      metadata: { via: 'paystack', channel: a.channel, reference: a.reference },
      createdAt: Date.now(),
    });
    if (order.status === 'cancelled') {
      // Paid after the order was released: staff need to either reinstate it or refund it.
      await ctx.db.insert('notifications', {
        type: 'refund_processed',
        title: 'Payment received for a cancelled order',
        message: `${orderNumber} was paid after it was released. Refund it or place it again.`,
        targetId: order._id,
        read: false,
        createdAt: Date.now(),
      });
    }
    return { state: 'paid', orderNumber };
  },
});

async function fetchVerification(secret: string, reference: string) {
  const res = await fetch(`${API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const json = (await res.json().catch(() => null)) as PaystackJson | null;
  if (!res.ok || !json?.data) return null;
  return {
    status: String(json.data.status ?? ''),
    amount: Number(json.data.amount ?? 0),
    currency: String(json.data.currency ?? ''),
    channel: json.data.channel ? String(json.data.channel) : undefined,
  };
}

/** Step 2: the customer is back from Paystack. Ask Paystack what happened and update the order. */
export const verifyPayment = action({
  args: { reference: v.string() },
  handler: async (ctx, { reference }): Promise<{ state: VerifyState; orderNumber?: string }> => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret || !/^[A-Za-z0-9._=-]{6,100}$/.test(reference)) return { state: 'unknown' };
    const result = await fetchVerification(secret, reference);
    if (!result) return { state: 'unknown' };
    return await ctx.runMutation(internal.paystack.applyVerification, { reference, ...result });
  },
});

// ---- unpaid orders are released so their stock goes back on the shelf --------------------------

export const unpaidInfo = internalQuery({
  args: { orderId: v.id('orders') },
  handler: async (ctx, { orderId }) => {
    const o = await ctx.db.get(orderId);
    if (!o) return null;
    return { settled: o.paymentStatus === 'paid' || o.status === 'cancelled', reference: o.paymentRef };
  },
});

export const cancelUnpaid = internalMutation({
  args: { orderId: v.id('orders') },
  handler: async (ctx, { orderId }) => {
    const o = await ctx.db.get(orderId);
    if (!o || o.paymentStatus === 'paid' || o.status === 'cancelled') return;
    await ctx.db.patch(orderId, { status: 'cancelled' });
    for (const item of o.items) {
      const productId = ctx.db.normalizeId('products', item.productId);
      if (productId) await applyStockChange(ctx, productId, item.qty, `Order ${o.orderNumber} released: payment not completed`);
    }
    await ctx.db.insert('auditLog', {
      action: 'ORDER_AUTO_CANCELLED',
      targetType: 'order',
      targetId: orderId,
      metadata: { reason: 'Online payment not completed in time', restocked: true },
      createdAt: Date.now(),
    });
  },
});

/** Runs 30 minutes after an online order is placed. Releases it if it was never paid. */
export const releaseUnpaid = internalAction({
  args: { orderId: v.id('orders') },
  handler: async (ctx, { orderId }): Promise<void> => {
    const info = await ctx.runQuery(internal.paystack.unpaidInfo, { orderId });
    if (!info || info.settled) return;

    // The customer may have paid and the notification may simply be late: ask Paystack first.
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (secret && info.reference) {
      try {
        const result = await fetchVerification(secret, info.reference);
        if (result) {
          const out = await ctx.runMutation(internal.paystack.applyVerification, { reference: info.reference, ...result });
          if (out.state === 'paid') return;
        }
      } catch {
        // If Paystack cannot be reached we still release the order below; a late payment is flagged to staff.
      }
    }
    await ctx.runMutation(internal.paystack.cancelUnpaid, { orderId });
  },
});
