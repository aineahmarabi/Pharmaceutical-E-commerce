import { query, mutation, internalMutation } from './_generated/server';
import { v } from 'convex/values';
import { Id } from './_generated/dataModel';
import { requireCustomerId } from './customerAuth';

// ─── QUERIES ─────────────────────────────────────────────────────────────

export const listOrders = query({
  args: {
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
    let q = ctx.db.query('orders').order('desc');

    if (args.status) {
      q = ctx.db.query('orders').withIndex('by_status', (q) => q.eq('status', args.status as any)).order('desc');
    } else if (args.customerId) {
      q = ctx.db.query('orders').withIndex('by_customer', (q) => q.eq('customerId', args.customerId)).order('desc');
    }

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
 * Public order tracking for guests (accounts are optional) — verifies
 * identity by requiring the order number PLUS a matching phone or email
 * rather than exposing orders by number alone.
 */
export const trackOrder = query({
  args: { orderNumber: v.string(), contact: v.string() },
  handler: async (ctx, { orderNumber, contact }) => {
    const normalizedNumber = orderNumber.trim().toUpperCase();
    const normalizedContact = contact.trim().toLowerCase();

    const order = await ctx.db
      .query('orders')
      .filter((q) => q.eq(q.field('orderNumber'), normalizedNumber))
      .first();

    if (!order) return { found: false as const, error: 'No order found with that number.' };

    const matches =
      order.customerEmail?.toLowerCase() === normalizedContact ||
      order.customerPhone?.toLowerCase() === normalizedContact ||
      order.customerPhone?.replace(/\s+/g, '') === contact.trim().replace(/\s+/g, '');

    if (!matches) {
      return { found: false as const, error: "That phone or email doesn't match this order." };
    }

    const timeline = await ctx.db
      .query('auditLog')
      .withIndex('by_action')
      .filter((q) => q.eq(q.field('targetId'), order._id))
      .order('desc')
      .collect();

    return { found: true as const, order, timeline };
  },
});

export const getOrderById = query({
  args: { orderId: v.id('orders') },
  handler: async (ctx, { orderId }) => {
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
  args: { orderId: v.id('orders') },
  handler: async (ctx, { orderId }) => {
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
  args: { orderId: v.id('orders'), body: v.string(), actorId: v.optional(v.id('staff')) },
  handler: async (ctx, { orderId, body, actorId }) => {
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
  handler: async (ctx, { orderId, changes, actorId }) => {
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error('Order not found');
    
    let currentItems = [...order.items];
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
  handler: async (ctx, { orderId, newStatus, carrier, trackingNumber }) => {
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
  args: { orderId: v.id('orders') },
  handler: async (ctx, { orderId }) => {
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
  args: { orderId: v.id('orders'), reason: v.string(), restock: v.boolean(), refund: v.boolean() },
  handler: async (ctx, { orderId, reason, restock, refund }) => {
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error('Order not found');

    await ctx.db.patch(orderId, { 
      status: 'cancelled',
      paymentStatus: refund ? 'refunded' : order.paymentStatus
    });

    if (restock) {
      for (const item of order.items) {
        await ctx.db.insert('inventoryLog', {
          productId: item.productId as any, // assuming valid ID
          changeAmount: item.qty,
          reason: `Order Cancelled: ${reason}`,
          createdAt: Date.now(),
        });
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
    orderId: v.id('orders'), 
    lineItemRefunds: v.array(v.object({ productId: v.string(), qty: v.number(), amount: v.number() })), 
    restockPerItem: v.array(v.boolean()) 
  },
  handler: async (ctx, { orderId, lineItemRefunds, restockPerItem }) => {
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error('Order not found');
    
    const totalRefundAmount = lineItemRefunds.reduce((acc, r) => acc + r.amount, 0);
    const status = (totalRefundAmount < order.total) ? 'partially_refunded' : 'refunded';
    
    await ctx.db.patch(orderId, { paymentStatus: status });

    lineItemRefunds.forEach(async (refund, idx) => {
      if (restockPerItem[idx]) {
        await ctx.db.insert('inventoryLog', {
          productId: refund.productId as any,
          changeAmount: refund.qty,
          reason: `Order Refunded`,
          createdAt: Date.now(),
        });
      }
    });

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
  args: { orderIds: v.array(v.id('orders')) },
  handler: async (ctx, { orderIds }) => {
    for (const id of orderIds) {
      await ctx.db.patch(id, { status: 'completed' });
    }
  },
});

export const bulkTag = mutation({
  args: { orderIds: v.array(v.id('orders')), tag: v.string() },
  handler: async (ctx, { orderIds, tag }) => {
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
  args: { orderIds: v.array(v.id('orders')) },
  handler: async (ctx, { orderIds }) => {
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
    customerId: v.optional(v.string()), 
    lineItems: v.array(v.object({ productId: v.string(), name: v.string(), qty: v.number(), price: v.number() })),
    customDiscount: v.optional(v.number()),
    createdBy: v.id('staff')
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('draftOrders', {
      ...args,
      invoiceStatus: 'open',
    });
  },
});

export const sendDraftOrderInvoice = mutation({
  args: { draftOrderId: v.id('draftOrders') },
  handler: async (ctx, { draftOrderId }) => {
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
  args: { draftOrderId: v.id('draftOrders') },
  handler: async (ctx, { draftOrderId }) => {
    await ctx.db.patch(draftOrderId, { invoiceStatus: 'paid' });
  },
});

export const convertDraftOrderToOrder = mutation({
  args: { draftOrderId: v.id('draftOrders') },
  handler: async (ctx, { draftOrderId }) => {
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
export const createOrder = mutation({
  args: {
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
    }

    // 3. Generate Order Number
    const allOrders = await ctx.db.query('orders').collect();
    const maxNum = allOrders.reduce((max, o) => {
      const n = parseInt(o.orderNumber.replace(/[^0-9]/g, ''), 10);
      return isNaN(n) ? max : Math.max(max, n);
    }, 1000);
    const orderNumber = `#PHR${maxNum + 1}`;

    // 4. Calculate totals from resolved (server-trusted) prices
    const subtotal = resolvedItems.reduce((acc, i) => acc + i.price * i.qty, 0);

    let deliveryFee: number;
    if (args.deliveryZoneId) {
      const zone = await ctx.db.get(args.deliveryZoneId);
      if (!zone || !zone.isActive) throw new Error('The selected delivery area is not available.');
      const thresholdSetting = await ctx.db
        .query('storeSettings')
        .withIndex('by_key', (q) => q.eq('key', 'deliveryThreshold'))
        .first();
      const threshold = typeof thresholdSetting?.value === 'number' ? thresholdSetting.value : 1500;
      deliveryFee = subtotal >= threshold ? 0 : zone.price;
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

      if (update.newQty <= 10) {
        const product = await ctx.db.get(update.id);
        if (product) {
          await ctx.db.insert('notifications', {
            type: 'low_stock',
            title: update.newQty <= 0 ? 'Out of stock' : 'Low stock warning',
            message: `${product.name} has ${update.newQty} unit(s) left`,
            targetId: update.id,
            read: false,
            createdAt: Date.now(),
          });
        }
      }
    }

    return orderId;
  }
});
