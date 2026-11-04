import { query, mutation, internalMutation, type MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import type { Id, Doc } from './_generated/dataModel';
import { requireCustomerId } from './customerAuth';
import { requireStaff, ANY_STAFF, MANAGERS } from './adminGuard';
import { lockedForMs, recordFailure } from './throttle';
import { syncLowStockNotification, applyStockChange } from './inventory';
import { internal } from './_generated/api';

// ─── QUERIES ─────────────────────────────────────────────────────────────

export const listOrders = query({
  args: {
    token: v.string(),
    status: v.optional(v.string()),
    paymentStatus: v.optional(v.string()),
    fulfillmentStatus: v.optional(v.string()), // Handled via status mostly, or added logic
    paymentMethod: v.optional(v.string()),
    dateRange: v.optional(v.object({ start: v.number(), end: v.number() })),
    customerId: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, ANY_STAFF);
    const q = args.status
      ? ctx.db.query('orders').withIndex('by_status', (q) => q.eq('status', args.status as Doc<'orders'>['status'])).order('desc')
      : args.customerId
        ? ctx.db.query('orders').withIndex('by_customer', (q) => q.eq('customerId', args.customerId)).order('desc')
        : ctx.db.query('orders').order('desc');

    let results = await q.collect();

    if (args.paymentMethod) results = results.filter((r) => r.paymentMethod === args.paymentMethod);
    if (args.paymentStatus) results = results.filter((r) => r.paymentStatus === args.paymentStatus);
    if (args.dateRange) {
      results = results.filter((r) => r._creationTime >= args.dateRange!.start && r._creationTime <= args.dateRange!.end);
    }
    if (args.search) {
      const s = args.search.toLowerCase();
      results = results.filter(
        (r) =>
          r.orderNumber.toLowerCase().includes(s) ||
          r.customerName.toLowerCase().includes(s) ||
          r.customerPhone.toLowerCase().includes(s) ||
          r.customerEmail.toLowerCase().includes(s)
      );
    }
    return results.slice(0, args.limit || 100);
  },
});

/**
 * Order history for a logged-in customer account. Accounts are optional
 * (see customerAuth.ts), so guests keep using trackOrder below instead.
 */
export const listMyOrders = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    let customerId;
    try {
      customerId = await requireCustomerId(ctx, args.token);
    } catch {
      return []; // expired/invalid session — treat as signed out rather than erroring the query
    }
    return await ctx.db
      .query('orders')
      .withIndex('by_customer', (q) => q.eq('customerId', customerId))
      .order('desc')
      .collect();
  },
});

/**
 * Distinct, currently in-stock products from a signed-in customer's most recent
 * orders (newest first) — powers the homepage "Buy again" shelf. Read-only.
 */
export const myBuyAgainProducts = query({
  args: { token: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { token, limit = 8 }) => {
    let customerId;
    try {
      customerId = await requireCustomerId(ctx, token);
    } catch {
      return [];
    }
    const orders = await ctx.db
      .query('orders')
      .withIndex('by_customer', (q) => q.eq('customerId', customerId))
      .order('desc')
      .take(20);
    const seen = new Set<string>();
    const out = [];
    for (const order of orders) {
      if (order.status === 'cancelled') continue;
      for (const item of order.items) {
        if (seen.has(item.productId)) continue;
        seen.add(item.productId);
        const product = await ctx.db.get(item.productId as Id<'products'>);
        if (!product || !product.inStock) continue;
        const imageUrl = product.imageStorageId
          ? ((await ctx.storage.getUrl(product.imageStorageId)) ?? product.imageUrl)
          : product.imageUrl;
        out.push({ ...product, imageUrl });
        if (out.length >= limit) return out;
      }
    }
    return out;
  },
});

/** A single order belonging to the signed-in customer (order detail page). */
export const getMyOrder = query({
  args: { token: v.string(), orderId: v.string() },
  handler: async (ctx, { token, orderId }) => {
    let customerId;
    try {
      customerId = await requireCustomerId(ctx, token);
    } catch {
      return null;
    }
    const id = ctx.db.normalizeId('orders', orderId);
    if (!id) return null;
    const order = await ctx.db.get(id);
    if (!order || order.customerId !== customerId) return null;
    return order;
  },
});

/**
 * Public order tracking for guests (accounts are optional) — verifies
 * identity by requiring the order number PLUS a matching phone or email
 * rather than exposing orders by number alone.
 */
export const trackOrder = mutation({
  args: { orderNumber: v.optional(v.string()), contact: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const orderNumber = (args.orderNumber ?? '').trim();
    const contact = (args.contact ?? '').trim();
    if (orderNumber.length > 40 || contact.length > 254) {
      return { found: false as const, error: 'No order found.' };
    }
    if (!orderNumber && !contact) return { found: false as const, error: 'Enter your order number, or the phone or email you ordered with.' };

    const typed = orderNumber.toUpperCase().replace(/\s+/g, '');
    const digits = /^#?(?:PHR)?(\d{1,9})$/.exec(typed);
    const normalizedNumber = digits ? `#PHR${digits[1]}` : typed;
    const normalizedContact = contact.toLowerCase();
    const contactIsEmail = normalizedContact.includes('@');
    const sameContact = (o: Doc<'orders'>) =>
      contactIsEmail
        ? o.customerEmail?.toLowerCase() === normalizedContact
        : !!lastNine(contact) && lastNine(o.customerPhone) === lastNine(contact);
    const slim = (o: Doc<'orders'>) => ({
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      total: o.total,
      createdAt: o._creationTime,
    });

    // Every attempt counts against a limit, so neither numbers nor contacts can be brute-forced.
    const limits: [string, number][] = [];
    if (orderNumber) limits.push([`track:${normalizedNumber}`, 8]);
    if (contact) limits.push([`track-contact:${contactIsEmail ? normalizedContact : lastNine(contact)}`, 8]);
    if (orderNumber && !contact) limits.push(['track-number-only', 120]);
    for (const [key] of limits) {
      if ((await lockedForMs(ctx, key)) > 0) return { found: false as const, error: 'Too many attempts. Please try again in a few minutes.' };
    }
    for (const [key, max] of limits) await recordFailure(ctx, key, max);

    // Contact only: that customer's recent orders, status only (no address or items).
    if (!orderNumber) {
      const recent = await ctx.db.query('orders').order('desc').take(400);
      const mine = recent.filter(sameContact).slice(0, 10).map(slim);
      if (mine.length === 0) return { found: false as const, error: 'No orders found for that phone or email.' };
      return { found: true as const, mode: 'status' as const, orders: mine };
    }

    const order = await ctx.db
      .query('orders')
      .withIndex('by_order_number', (q) => q.eq('orderNumber', normalizedNumber))
      .first();
    if (!order) return { found: false as const, error: 'No order found with that number.' };

    // Number only: status and progress, nothing personal.
    if (!contact) return { found: true as const, mode: 'status' as const, orders: [slim(order)] };

    // Both given: the full order, but only to someone who knows the matching phone or email.
    if (!sameContact(order)) return { found: false as const, error: "That phone or email doesn't match this order." };

    const timeline = await ctx.db
      .query('auditLog')
      .withIndex('by_action')
      .filter((q) => q.eq(q.field('targetId'), order._id))
      .order('desc')
      .collect();

    return { found: true as const, mode: 'full' as const, order, timeline };
  },
});

const lastNine = (p?: string) => (p ?? '').replace(/\D/g, '').slice(-9);

/**
 * Status of orders this device placed as a guest. The device sends the order ids it remembered plus the phone used;
 * ids are unguessable, and the phone must match, so nobody can read an order without already holding both.
 */
export const trackOnDevice = query({
  args: { refs: v.array(v.object({ orderId: v.string(), phone: v.string() })) },
  handler: async (ctx, { refs }) => {
    const out: {
      _id: Id<'orders'>;
      orderNumber: string;
      status: Doc<'orders'>['status'];
      paymentStatus: Doc<'orders'>['paymentStatus'];
      paymentMethod: Doc<'orders'>['paymentMethod'];
      total: number;
      createdAt: number;
    }[] = [];
    for (const ref of refs.slice(0, 20)) {
      const id = ctx.db.normalizeId('orders', ref.orderId);
      if (!id) continue;
      const order = await ctx.db.get(id);
      if (!order || lastNine(order.customerPhone) !== lastNine(ref.phone) || !lastNine(ref.phone)) continue;
      out.push({
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        total: order.total,
        createdAt: order._creationTime,
      });
    }
    return out;
  },
});

export const getOrderById = query({
  args: {
    token: v.string(), orderId: v.id('orders') },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, ANY_STAFF);
    const { orderId } = args;
    const order = await ctx.db.get(orderId);
    if (!order) return null;

    const timeline = await ctx.db
      .query('auditLog')
      .withIndex('by_action')
      .filter((q) => q.eq(q.field('targetId'), orderId))
      .order('desc')
      .collect();

    const riskFlag = await ctx.db
      .query('riskFlags')
      .withIndex('by_order', (q) => q.eq('orderId', orderId))
      .first();

    // The order object already has items (line items), and breakdown fields.
    // If a prescription reference exists, it would be a custom field on order, simulated here.
    return {
      order,
      timeline,
      riskFlag,
    };
  },
});

// ─── MUTATIONS ───────────────────────────────────────────────────────────

export const captureAuthorizedPayment = mutation({
  args: {
    token: v.string(), orderId: v.id('orders') },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, ANY_STAFF);
    const { orderId } = args;
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error('Order not found');
    if (order.paymentStatus !== 'pending') throw new Error('Order is not in pending/authorized state');
    
    await ctx.db.patch(orderId, { paymentStatus: 'paid' });
    
    // Write audit log
    await ctx.db.insert('auditLog', {
      action: 'CAPTURE_PAYMENT',
      targetType: 'order',
      targetId: orderId,
      createdAt: Date.now(),
    });
  },
});

export const addOrderTimelineNote = mutation({
  args: {
    token: v.string(), orderId: v.id('orders'), body: v.string(), actorId: v.optional(v.id('staff')) },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, ANY_STAFF);
    const { orderId, body, actorId } = args;
    await ctx.db.insert('auditLog', {
      actorId,
      action: 'NOTE_ADDED',
      targetType: 'order',
      targetId: orderId,
      metadata: { body }, // Supports @mention string natively as text
      createdAt: Date.now(),
    });
  },
});

export const editOrderLineItems = mutation({
  args: {
    token: v.string(), 
    orderId: v.id('orders'), 
    changes: v.array(v.object({
      changeType: v.union(v.literal('addItem'), v.literal('removeItem'), v.literal('quantityChange')),
      productId: v.string(),
      qtyDelta: v.number(), // positive for add/increase, negative for remove/decrease
      price: v.number(),
      name: v.string(),
    })),
    actorId: v.id('staff')
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, MANAGERS);
    const { orderId, changes, actorId } = args;
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error('Order not found');
    
    const currentItems = [...order.items];
    let diffAmount = 0;
    
    for (const change of changes) {
      const idx = currentItems.findIndex(i => i.productId === change.productId);
      const lineItemDiff = change.qtyDelta * change.price;
      diffAmount += lineItemDiff;
      
      if (change.changeType === 'addItem') {
        if (idx >= 0) {
          currentItems[idx] = { ...currentItems[idx], qty: currentItems[idx].qty + change.qtyDelta };
        } else {
          currentItems.push({ productId: change.productId, name: change.name, qty: change.qtyDelta, price: change.price });
        }
      } else if (change.changeType === 'removeItem') {
        if (idx >= 0) {
          currentItems.splice(idx, 1);
        }
      } else if (change.changeType === 'quantityChange') {
        if (idx >= 0) {
          currentItems[idx] = { ...currentItems[idx], qty: currentItems[idx].qty + change.qtyDelta };
          if (currentItems[idx].qty <= 0) currentItems.splice(idx, 1);
        }
      }
      
      // Write to orderEdits
      await ctx.db.insert('orderEdits', {
        orderId,
        changeType: change.changeType,
        diffAmount: lineItemDiff,
        actorId,
        createdAt: Date.now(),
      });
    }
    
    const newSubtotal = currentItems.reduce((acc, item) => acc + (item.qty * item.price), 0);
    const newTotal = newSubtotal + order.deliveryFee; // Assuming flat delivery fee
    
    await ctx.db.patch(orderId, {
      items: currentItems,
      subtotal: newSubtotal,
      total: newTotal,
    });
    
    return { diffAmount }; // Returns what customer owes (if positive) or is owed (if negative)
  },
});

export const updateFulfillmentStatus = mutation({
  args: {
    token: v.string(), 
    orderId: v.id('orders'), 
    newStatus: v.union(
      v.literal('placed'),
      v.literal('confirmed'),
      v.literal('packed'),
      v.literal('delivering'),
      v.literal('completed'),
      v.literal('cancelled')
    ), 
    locationId: v.optional(v.string()), 
    carrier: v.optional(v.string()), 
    trackingNumber: v.optional(v.string()), 
    notifyCustomer: v.boolean() 
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, ANY_STAFF);
    const { orderId, newStatus, carrier, trackingNumber } = args;
    await ctx.db.patch(orderId, { status: newStatus });
    
    await ctx.db.insert('auditLog', {
      action: 'UPDATE_FULFILLMENT',
      targetType: 'order',
      targetId: orderId,
      metadata: { newStatus, carrier, trackingNumber },
      createdAt: Date.now(),
    });
  },
});

export const markCodCollected = mutation({
  args: {
    token: v.string(), orderId: v.id('orders') },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, ANY_STAFF);
    const { orderId } = args;
    const order = await ctx.db.get(orderId);
    if (!order || order.paymentMethod !== 'cod') throw new Error('Invalid order for COD collection');

    await ctx.db.patch(orderId, { paymentStatus: 'collected' });

    await ctx.db.insert('auditLog', {
      action: 'MARK_COD_COLLECTED',
      targetType: 'order',
      targetId: orderId,
      createdAt: Date.now(),
    });
  },
});

export const cancelOrder = mutation({
  args: {
    token: v.string(), orderId: v.id('orders'), reason: v.string(), restock: v.boolean(), refund: v.boolean() },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, ANY_STAFF);
    const { orderId, reason, restock, refund } = args;
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error('Order not found');
    if (order.status === 'cancelled') throw new Error('This order is already cancelled.');

    await ctx.db.patch(orderId, {
      status: 'cancelled',
      paymentStatus: refund ? 'refunded' : order.paymentStatus
    });

    if (restock) {
      for (const item of order.items) {
        const productId = ctx.db.normalizeId('products', item.productId);
        if (productId) await applyStockChange(ctx, productId, item.qty, `Order ${order.orderNumber} cancelled: ${reason}`);
      }
    }

    await ctx.db.insert('auditLog', {
      action: 'CANCEL_ORDER',
      targetType: 'order',
      targetId: orderId,
      metadata: { reason, restocked: restock, refunded: refund },
      createdAt: Date.now(),
    });
  },
});

export const refundOrder = mutation({
  args: {
    token: v.string(), 
    orderId: v.id('orders'), 
    lineItemRefunds: v.array(v.object({ productId: v.string(), qty: v.number(), amount: v.number() })), 
    restockPerItem: v.array(v.boolean()) 
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, MANAGERS);
    const { orderId, lineItemRefunds, restockPerItem } = args;
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error('Order not found');
    
    const totalRefundAmount = lineItemRefunds.reduce((acc, r) => acc + r.amount, 0);
    const status = (totalRefundAmount < order.total) ? 'partially_refunded' : 'refunded';
    
    await ctx.db.patch(orderId, { paymentStatus: status });

    // Sequential and awaited, so the stock changes are part of the same transaction as the refund.
    for (let idx = 0; idx < lineItemRefunds.length; idx++) {
      const refund = lineItemRefunds[idx];
      if (!restockPerItem[idx]) continue;
      const line = order.items.find((i) => i.productId === refund.productId);
      if (!line || !Number.isInteger(refund.qty) || refund.qty < 1 || refund.qty > line.qty) {
        throw new Error('A refunded item does not match the order.');
      }
      const productId = ctx.db.normalizeId('products', refund.productId);
      if (productId) await applyStockChange(ctx, productId, refund.qty, `Order ${order.orderNumber} refunded`);
    }

    await ctx.db.insert('auditLog', {
      action: 'REFUND_ORDER',
      targetType: 'order',
      targetId: orderId,
      metadata: { amount: totalRefundAmount, status },
      createdAt: Date.now(),
    });
  },
});

export const flagRisk = internalMutation({
  args: { orderId: v.id('orders'), riskLevel: v.union(v.literal('low'), v.literal('medium'), v.literal('high')), reasons: v.array(v.string()) },
  handler: async (ctx, { orderId, riskLevel, reasons }) => {
    await ctx.db.insert('riskFlags', {
      orderId,
      riskLevel,
      reasons,
    });
  },
});

// ─── BULK ACTIONS ────────────────────────────────────────────────────────

export const bulkFulfill = mutation({
  args: {
    token: v.string(), orderIds: v.array(v.id('orders')) },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, ANY_STAFF);
    const { orderIds } = args;
    for (const id of orderIds) {
      await ctx.db.patch(id, { status: 'completed' });
    }
  },
});

export const bulkTag = mutation({
  args: {
    token: v.string(), orderIds: v.array(v.id('orders')), tag: v.string() },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, MANAGERS);
    const { orderIds, tag } = args;
    // Orders table doesn't have tags natively, we'll write to auditLog to register the bulk action
    // If order tags were in schema, we'd patch here.
    for (const id of orderIds) {
      await ctx.db.insert('auditLog', {
        action: 'BULK_TAG_ORDER',
        targetType: 'order',
        targetId: id,
        metadata: { tag },
        createdAt: Date.now(),
      });
    }
  },
});

export const bulkExportCsv = query({
  args: {
    token: v.string(), orderIds: v.array(v.id('orders')) },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, MANAGERS);
    const { orderIds } = args;
    const orders = [];
    for (const id of orderIds) {
      const o = await ctx.db.get(id);
      if (o) orders.push(o);
    }
    return orders;
  },
});

// ─── DRAFT ORDERS ────────────────────────────────────────────────────────

export const createDraftOrder = mutation({
  args: {
    token: v.string(), 
    customerId: v.optional(v.string()), 
    lineItems: v.array(v.object({ productId: v.string(), name: v.string(), qty: v.number(), price: v.number() })),
    customDiscount: v.optional(v.number()),
    createdBy: v.id('staff')
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, MANAGERS);
    return await ctx.db.insert('draftOrders', {
      ...args,
      invoiceStatus: 'open',
    });
  },
});

export const sendDraftOrderInvoice = mutation({
  args: {
    token: v.string(), draftOrderId: v.id('draftOrders') },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, MANAGERS);
    const { draftOrderId } = args;
    // In a real app this would trigger an email. We just log it.
    await ctx.db.insert('auditLog', {
      action: 'SEND_INVOICE',
      targetType: 'draftOrder',
      targetId: draftOrderId,
      createdAt: Date.now(),
    });
  },
});

export const markDraftOrderPaid = mutation({
  args: {
    token: v.string(), draftOrderId: v.id('draftOrders') },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, MANAGERS);
    const { draftOrderId } = args;
    await ctx.db.patch(draftOrderId, { invoiceStatus: 'paid' });
  },
});

export const convertDraftOrderToOrder = mutation({
  args: {
    token: v.string(), draftOrderId: v.id('draftOrders') },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, MANAGERS);
    const { draftOrderId } = args;
    const draft = await ctx.db.get(draftOrderId);
    if (!draft) throw new Error('Draft not found');
    
    const subtotal = draft.lineItems.reduce((acc, item) => acc + (item.qty * item.price), 0);
    const total = subtotal - (draft.customDiscount || 0);

    const orderId = await ctx.db.insert('orders', {
      orderNumber: `DRAFT-${Math.floor(Math.random() * 10000)}`,
      customerId: draft.customerId,
      customerName: draft.customerId ? 'Draft Customer' : 'Walk-in',
      customerPhone: '',
      customerEmail: '',
      items: draft.lineItems,
      subtotal,
      deliveryFee: 0,
      total,
      status: 'placed',
      paymentMethod: 'cod', // Defaulting for converted drafts
      paymentStatus: draft.invoiceStatus === 'paid' ? 'paid' : 'pending',
      deliveryAddress: 'In-Store',
    });
    
    return orderId;
  },
});
/** Next sequential order number, derived from the newest orders only (no full-table scan). */
async function nextOrderNumber(ctx: MutationCtx): Promise<string> {
  const recent = await ctx.db.query('orders').order('desc').take(25);
  let max = 1000;
  for (const o of recent) {
    const m = /^#PHR(\d+)$/.exec(o.orderNumber);
    if (m) {
      max = Math.max(max, parseInt(m[1], 10));
      break;
    }
  }
  return `#PHR${max + 1}`;
}

export const createOrder = mutation({
  args: {
    token: v.string(),
    customerId: v.optional(v.string()),
    customerName: v.string(),
    customerPhone: v.string(),
    customerEmail: v.string(),
    items: v.array(
      v.object({
        productId: v.string(),
        name: v.string(),
        qty: v.number(),
        price: v.number(),
      })
    ),
    deliveryAddress: v.string(),
    notes: v.optional(v.string()),
    paymentMethod: v.union(v.literal('mpesa'), v.literal('card'), v.literal('cod')),
    paymentStatus: v.optional(v.union(v.literal('pending'), v.literal('paid'), v.literal('collected'), v.literal('refunded'), v.literal('partially_refunded'))),
    status: v.optional(v.union(
      v.literal('placed'),
      v.literal('confirmed'),
      v.literal('packed'),
      v.literal('delivering'),
      v.literal('completed'),
      v.literal('cancelled')
    )),
    // Storefront checkout passes the selected zone so the fee is computed
    // server-side from the canonical zone price — never trust a client-supplied fee.
    deliveryZoneId: v.optional(v.id('deliveryZones')),
    deliveryFee: v.optional(v.number()),
    channel: v.optional(v.string()),
    prescriptionFileId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token, ANY_STAFF);
    // 1. Validate required order-level fields
    if (args.items.length === 0) throw new Error('Your cart is empty.');
    if (!args.customerName.trim()) throw new Error('Customer name is required.');
    if (args.channel === 'storefront' && !args.customerPhone.trim() && !args.customerEmail.trim()) {
      throw new Error('A phone number or email is required.');
    }
    if (!args.deliveryAddress.trim()) throw new Error('Delivery address is required.');

    // 2. Resolve each line item against the database — quantity comes from the
    // client, but name/price/stock are always sourced from the product record
    // so a tampered request can't under-price an order or oversell stock.
    const resolvedItems: Array<{ productId: string; name: string; qty: number; price: number }> = [];
    const inventoryUpdates: Array<{ id: Id<'products'>; newQty: number }> = [];
    const productById = new Map<Id<'products'>, Doc<'products'>>();

    for (const item of args.items) {
      if (!Number.isFinite(item.qty) || item.qty <= 0) {
        throw new Error(`Invalid quantity for ${item.name}.`);
      }
      const product = await ctx.db.get(item.productId as Id<'products'>);
      if (!product) throw new Error(`${item.name} is no longer available.`);
      if (!product.inStock || product.stockQty < item.qty) {
        throw new Error(`Only ${Math.max(product.stockQty, 0)} unit(s) of ${product.name} left in stock.`);
      }
      resolvedItems.push({ productId: item.productId, name: product.name, qty: item.qty, price: product.price });
      inventoryUpdates.push({ id: product._id, newQty: product.stockQty - item.qty });
      productById.set(product._id, product);
    }

    // 3. Generate Order Number
    const orderNumber = await nextOrderNumber(ctx);

    // 4. Calculate totals from resolved (server-trusted) prices
    const subtotal = resolvedItems.reduce((acc, i) => acc + i.price * i.qty, 0);

    let deliveryFee: number;
    if (args.deliveryZoneId) {
      const zone = await ctx.db.get(args.deliveryZoneId);
      if (!zone || !zone.isActive) throw new Error('The selected delivery area is not available.');
      deliveryFee = zone.price;
    } else {
      deliveryFee = args.deliveryFee ?? 250;
    }
    const total = subtotal + deliveryFee;

    // 5. Create Order
    const orderId = await ctx.db.insert('orders', {
      orderNumber,
      customerId: args.customerId,
      customerName: args.customerName.trim(),
      customerPhone: args.customerPhone.trim(),
      customerEmail: args.customerEmail.trim(),
      items: resolvedItems,
      subtotal,
      deliveryFee,
      total,
      status: args.status ?? 'placed',
      paymentMethod: args.paymentMethod,
      paymentStatus: args.paymentStatus ?? 'pending',
      deliveryAddress: args.deliveryAddress.trim(),
      notes: args.notes?.trim() || undefined,
      channel: args.channel ?? 'Admin POS',
      prescriptionFileId: args.prescriptionFileId,
    });

    await ctx.db.insert('notifications', {
      type: 'new_order',
      title: 'New order received',
      message: `${orderNumber} — ${args.customerName} · KES ${total.toLocaleString()}`,
      targetId: orderId,
      read: false,
      createdAt: Date.now(),
    });

    // 6. Apply inventory decrements
    for (const update of inventoryUpdates) {
      await ctx.db.patch(update.id, {
        stockQty: update.newQty,
        inStock: update.newQty > 0
      });
      // create audit trail for inventory
      await ctx.db.insert('inventoryLog', {
        productId: update.id,
        changeAmount: -resolvedItems.find(i => i.productId === update.id)!.qty,
        reason: `Order ${orderNumber}`,
        createdAt: Date.now(),
      });

      const lowProduct = productById.get(update.id);
      if (lowProduct) await syncLowStockNotification(ctx, lowProduct, lowProduct.stockQty, update.newQty);
    }

    return orderId;
  }
});

/**
 * Public storefront checkout. Deliberately restricted: the client only supplies who is
 * buying, what (productId + qty) and where. Prices, names, fee, channel, status and
 * payment status are all decided here, never trusted from the request.
 */
export const placeOrder = mutation({
  args: {
    customerName: v.string(),
    customerPhone: v.string(),
    customerEmail: v.string(),
    items: v.array(v.object({ productId: v.string(), qty: v.number() })),
    deliveryZoneId: v.optional(v.id('deliveryZones')),
    pickup: v.optional(v.boolean()),
    deliveryAddress: v.string(),
    notes: v.optional(v.string()),
    paymentMethod: v.union(v.literal('mpesa'), v.literal('cod'), v.literal('paystack')),
    prescriptionFileId: v.optional(v.id('_storage')),
    urgent: v.optional(v.boolean()),
    customerToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const name = args.customerName.trim();
    const phone = args.customerPhone.trim();
    const email = args.customerEmail.trim();
    const address = args.deliveryAddress.trim();
    const notes = args.notes?.trim();

    if (args.items.length === 0) throw new Error('Your cart is empty.');
    if (args.items.length > 50) throw new Error('Too many items in one order.');
    if (!name) throw new Error('Customer name is required.');
    if (name.length > 100) throw new Error('Name is too long.');
    if (!phone && !email) throw new Error('A phone number or email is required.');
    if (phone.length > 30) throw new Error('Phone number is too long.');
    if (email.length > 254) throw new Error('Email is too long.');
    if (!address) throw new Error('Delivery address is required.');
    if (address.length > 300) throw new Error('Delivery address is too long.');
    if (notes && notes.length > 1000) throw new Error('Notes are too long.');

    // Rate limit per phone number (every attempt counts).
    const digits = phone.replace(/\D/g, '');
    if (digits) {
      const key = `order:${digits}`;
      if ((await lockedForMs(ctx, key)) > 0) {
        throw new Error('Too many orders from this number. Please try again later.');
      }
      await recordFailure(ctx, key, 10);
    }

    // Unpaid online orders hold stock for 30 minutes, so cap them (per customer and overall) to stop anyone
    // tying up the shelves with orders they never pay for.
    if (args.paymentMethod === 'paystack') {
      const since = Date.now() - 30 * 60 * 1000;
      const recent = await ctx.db.query('orders').order('desc').take(120);
      const unpaid = recent.filter(
        (o) => o._creationTime > since && o.paymentMethod === 'paystack' && o.paymentStatus !== 'paid' && o.status !== 'cancelled',
      );
      const mine = unpaid.filter(
        (o) => (digits && o.customerPhone.replace(/\D/g, '').slice(-9) === digits.slice(-9)) || (email && o.customerEmail?.toLowerCase() === email.toLowerCase()),
      );
      if (mine.length >= 3) throw new Error('You already have unpaid orders waiting. Please pay for them or try again in a few minutes.');
      if (unpaid.length >= 40) throw new Error('We are busy right now. Please try again in a few minutes.');
    }

    // Signed-in customers: derive the account from the session token, never from the client.
    let customerId: string | undefined;
    if (args.customerToken) {
      try {
        customerId = await requireCustomerId(ctx, args.customerToken);
      } catch {
        customerId = undefined;
      }
    }

    // Resolve lines against the database; merge duplicates so stock checks are accurate.
    const wanted = new Map<Id<'products'>, number>();
    for (const item of args.items) {
      if (!Number.isInteger(item.qty) || item.qty < 1 || item.qty > 50) {
        throw new Error('Invalid quantity: choose between 1 and 50.');
      }
      const id = ctx.db.normalizeId('products', item.productId);
      if (!id) throw new Error('An item in your cart is no longer available.');
      wanted.set(id, (wanted.get(id) ?? 0) + item.qty);
    }

    const resolvedItems: Array<{ productId: string; name: string; qty: number; price: number }> = [];
    const inventoryUpdates: Array<{ product: Doc<'products'>; qty: number; newQty: number }> = [];
    for (const [id, qty] of wanted) {
      const product = await ctx.db.get(id);
      if (!product) throw new Error('An item in your cart is no longer available.');
      if (qty > 50) throw new Error('Invalid quantity: choose between 1 and 50.');
      if (!product.inStock || product.stockQty < qty) {
        throw new Error(`Only ${Math.max(product.stockQty, 0)} unit(s) of ${product.name} left in stock.`);
      }
      resolvedItems.push({ productId: id, name: product.name, qty, price: product.price });
      inventoryUpdates.push({ product, qty, newQty: product.stockQty - qty });
    }

    let deliveryFee = 0;
    if (!args.pickup) {
      if (!args.deliveryZoneId) throw new Error('Select a delivery area.');
      const zone = await ctx.db.get(args.deliveryZoneId);
      if (!zone || !zone.isActive) throw new Error('The selected delivery area is not available.');
      deliveryFee = zone.price;
    }

    const subtotal = resolvedItems.reduce((acc, i) => acc + i.price * i.qty, 0);
    const total = subtotal + deliveryFee;
    const orderNumber = await nextOrderNumber(ctx);

    const orderId = await ctx.db.insert('orders', {
      orderNumber,
      customerId,
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      items: resolvedItems,
      subtotal,
      deliveryFee,
      total,
      status: 'placed',
      paymentMethod: args.paymentMethod,
      paymentStatus: 'pending',
      deliveryAddress: address,
      notes: notes || undefined,
      urgent: args.urgent || undefined,
      channel: 'Website',
      prescriptionFileId: args.prescriptionFileId,
    });

    await ctx.db.insert('notifications', {
      type: 'new_order',
      title: args.urgent ? 'Urgent order received' : 'New order received',
      message: `${args.urgent ? 'URGENT · ' : ''}${orderNumber} — ${name} · KES ${total.toLocaleString()}`,
      targetId: orderId,
      read: false,
      createdAt: Date.now(),
    });

    for (const u of inventoryUpdates) {
      await ctx.db.patch(u.product._id, { stockQty: u.newQty, inStock: u.newQty > 0 });
      await ctx.db.insert('inventoryLog', {
        productId: u.product._id,
        changeAmount: -u.qty,
        reason: `Order ${orderNumber}`,
        createdAt: Date.now(),
      });
      await syncLowStockNotification(ctx, u.product, u.product.stockQty, u.newQty);
    }

    // Online payment: the stock is held for 30 minutes. If the payment is not completed by then,
    // the order is released and the units go back on the shelf (see paystack.releaseUnpaid).
    if (args.paymentMethod === 'paystack') {
      await ctx.scheduler.runAfter(30 * 60 * 1000, internal.paystack.releaseUnpaid, { orderId });
    }

    return orderId;
  },
});
