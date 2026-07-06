import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const listAuditLogs = query({
  args: {
    actorId: v.optional(v.id('staff')),
    action: v.optional(v.string()),
    targetType: v.optional(v.string()),
    dateRange: v.optional(v.object({ start: v.number(), end: v.number() })),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query('auditLog').order('desc');

    if (args.actorId) {
      q = ctx.db.query('auditLog').withIndex('by_actor', q => q.eq('actorId', args.actorId)).order('desc');
    } else if (args.action) {
      q = ctx.db.query('auditLog').withIndex('by_action', q => q.eq('action', args.action!)).order('desc');
    }

    let results = await q.collect();

    if (args.actorId && args.action) {
      results = results.filter(r => r.action === args.action);
    }
    
    if (args.targetType) {
      results = results.filter(r => r.targetType === args.targetType);
    }

    if (args.dateRange) {
      results = results.filter(r => r.createdAt >= args.dateRange!.start && r.createdAt <= args.dateRange!.end);
    }

    return results.slice(0, args.limit || 100);
  },
});

export const writeAuditLog = mutation({
  args: {
    actorId: v.optional(v.id('staff')),
    action: v.string(),
    targetType: v.string(),
    targetId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('auditLog', {
      ...args,
      createdAt: Date.now(),
    });
  },
});
