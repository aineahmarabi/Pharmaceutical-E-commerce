import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const listCustomers = query({
  args: {
    search: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    segmentId: v.optional(v.string()),
    sortBy: v.optional(v.union(v.literal('lastOrder'), v.literal('totalSpent'), v.literal('ordersCount'))),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db.query('orders').collect();
    
    // Group by email/phone as a proxy for customer
    const customersMap = new Map<string, any>();
    
    for (const order of orders) {
      const id = order.customerEmail || order.customerPhone || 'unknown';
      if (!customersMap.has(id)) {
        customersMap.set(id, {
          id,
          name: order.customerName,
          phone: order.customerPhone,
          email: order.customerEmail,
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: 0,
          tags: [],
        });
      }
      const c = customersMap.get(id);
      c.totalOrders += 1;
      c.totalSpent += order.total;
      if (order._creationTime > c.lastOrderDate) {
        c.lastOrderDate = order._creationTime;
      }
    }

    const allTags = await ctx.db.query('customerTags').collect();
    for (const t of allTags) {
      const c = customersMap.get(t.customerId);
      if (c) c.tags.push(t.tag);
    }
    
    let results = Array.from(customersMap.values());

    if (args.search) {
      const s = args.search.toLowerCase();
      results = results.filter(c => 
        (c.name && c.name.toLowerCase().includes(s)) || 
        (c.email && c.email.toLowerCase().includes(s)) ||
        (c.phone && c.phone.toLowerCase().includes(s))
      );
    }

    if (args.tags && args.tags.length > 0) {
      results = results.filter(c => args.tags!.every(t => c.tags.includes(t)));
    }

    // Sort
    if (args.sortBy === 'totalSpent') {
      results.sort((a, b) => b.totalSpent - a.totalSpent);
    } else if (args.sortBy === 'ordersCount') {
      results.sort((a, b) => b.totalOrders - a.totalOrders);
    } else {
      results.sort((a, b) => b.lastOrderDate - a.lastOrderDate); // Default lastOrder
    }
    
    return results;
  },
});

export const getCustomerById = query({
  args: { customerId: v.string() }, // pseudo-id (email or phone)
  handler: async (ctx, { customerId }) => {
    const orders = await ctx.db.query('orders').collect();
    const customerOrders = orders.filter(o => o.customerEmail === customerId || o.customerPhone === customerId);
    
    if (customerOrders.length === 0) return null;
    
    const latestOrder = customerOrders.sort((a, b) => b._creationTime - a._creationTime)[0];
    const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = customerOrders.length;
    
    const tags = await ctx.db.query('customerTags')
      .withIndex('by_customer', q => q.eq('customerId', customerId))
      .collect();

    const notes = await ctx.db.query('customerNotes')
      .withIndex('by_customer', q => q.eq('customerId', customerId))
      .order('desc')
      .collect();

    // Populate notes with author details
    const populatedNotes = [];
    for (const note of notes) {
      const author = await ctx.db.get(note.authorId);
      populatedNotes.push({
        ...note,
        authorName: author ? author.name : 'Unknown Staff'
      });
    }

    // Segments simulation (since it's expression-based, just an empty list for now unless we evaluate expressions here)
    const segments: any[] = [];
      
    return {
      customer: {
        id: customerId,
        name: latestOrder.customerName,
        phone: latestOrder.customerPhone,
        email: latestOrder.customerEmail,
        totalOrders,
        totalSpent,
        aov: totalSpent / totalOrders,
        lastOrderDate: latestOrder._creationTime,
        address: latestOrder.deliveryAddress,
      },
      orders: customerOrders,
      tags: tags.map(t => t.tag),
      notes: populatedNotes,
      segments,
    };
  },
});

export const updateCustomerNotes = mutation({
  args: { customerId: v.string(), note: v.string(), authorId: v.id('staff') },
  handler: async (ctx, { customerId, note, authorId }) => {
    await ctx.db.insert('customerNotes', {
      customerId,
      authorId,
      body: note,
      createdAt: Date.now(),
    });
  },
});

export const addTag = mutation({
  args: { customerId: v.string(), tag: v.string() },
  handler: async (ctx, { customerId, tag }) => {
    const existing = await ctx.db.query('customerTags')
      .withIndex('by_customer', q => q.eq('customerId', customerId))
      .filter(q => q.eq(q.field('tag'), tag))
      .first();
      
    if (!existing) {
      await ctx.db.insert('customerTags', { customerId, tag });
    }
  },
});

export const removeTag = mutation({
  args: { customerId: v.string(), tag: v.string() },
  handler: async (ctx, { customerId, tag }) => {
    const existing = await ctx.db.query('customerTags')
      .withIndex('by_customer', q => q.eq('customerId', customerId))
      .filter(q => q.eq(q.field('tag'), tag))
      .first();
      
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
