import { query, internalQuery, internalMutation } from './_generated/server';
import { v } from 'convex/values';
import type { QueryCtx } from './_generated/server';
import type { Doc } from './_generated/dataModel';

// ─── Helper: resolve image URL from storage or fallback ────────────────────
async function resolveImageUrl(
  ctx: { storage: { getUrl: (id: string) => Promise<string | null> } },
  storageId: string | undefined,
  fallback: string | undefined
): Promise<string | undefined> {
  if (storageId) {
    const url = await ctx.storage.getUrl(storageId);
    return url ?? fallback;
  }
  return fallback;
}

// ─── CLIENT-FACING QUERIES (never return out-of-stock) ─────────────────────

/** Trending products — excludes out-of-stock */
export const listTrending = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 8 }) => {
    const products = await ctx.db
      .query('products')
      .withIndex('by_trending', (q) => q.eq('isTrending', true))
      .filter((q) => q.eq(q.field('inStock'), true))
      .take(limit);
    return Promise.all(
      products.map(async (p) => ({
        ...p,
        imageUrl: await resolveImageUrl(ctx, p.imageStorageId, p.imageUrl),
      }))
    );
  },
});

/** Best-sellers — excludes out-of-stock */
export const listBestSellers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 8 }) => {
    const products = await ctx.db
      .query('products')
      .withIndex('by_best_seller', (q) => q.eq('isBestSeller', true))
      .filter((q) => q.eq(q.field('inStock'), true))
      .take(limit);
    return Promise.all(
      products.map(async (p) => ({
        ...p,
        imageUrl: await resolveImageUrl(ctx, p.imageStorageId, p.imageUrl),
      }))
    );
  },
});

/** New arrivals — excludes out-of-stock */
export const listNewArrivals = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 8 }) => {
    const products = await ctx.db
      .query('products')
      .withIndex('by_new', (q) => q.eq('isNew', true))
      .filter((q) => q.eq(q.field('inStock'), true))
      .take(limit);
    return Promise.all(
      products.map(async (p) => ({
        ...p,
        imageUrl: await resolveImageUrl(ctx, p.imageStorageId, p.imageUrl),
      }))
    );
  },
});

/** Special offers — excludes out-of-stock and expired offers */
export const listOffers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 6 }) => {
    const now = Date.now();
    const candidates = await ctx.db
      .query('products')
      .withIndex('by_offer', (q) => q.eq('isOffer', true))
      .filter((q) => q.eq(q.field('inStock'), true))
      .collect();
    const products = candidates
      .filter((p) => p.offerEndsAt === undefined || p.offerEndsAt > now)
      .slice(0, limit);
    return Promise.all(
      products.map(async (p) => ({
        ...p,
        imageUrl: await resolveImageUrl(ctx, p.imageStorageId, p.imageUrl),
      }))
    );
  },
});

/** Products by category — excludes out-of-stock */
export const listByCategory = query({
  args: { categorySlug: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { categorySlug, limit = 20 }) => {
    const products = await ctx.db
      .query('products')
      .withIndex('by_category', (q) => q.eq('categorySlug', categorySlug))
      .filter((q) => q.eq(q.field('inStock'), true))
      .take(limit);
    return Promise.all(
      products.map(async (p) => ({
        ...p,
        imageUrl: await resolveImageUrl(ctx, p.imageStorageId, p.imageUrl),
      }))
    );
  },
});

/** Fetch a specific set of products by id — used for the wishlist */
export const listByIds = query({
  args: { ids: v.array(v.id('products')) },
  handler: async (ctx, { ids }) => {
    const results = await Promise.all(ids.map((id) => ctx.db.get(id)));
    const found = results.filter((p): p is NonNullable<typeof p> => p !== null);
    return Promise.all(
      found.map(async (p) => ({
        ...p,
        imageUrl: await resolveImageUrl(ctx, p.imageStorageId, p.imageUrl),
      }))
    );
  },
});

/** All products for the /products listing — excludes out-of-stock, supports filter+sort */
/**
 * Homepage shelves: one shelf per category that currently has products in stock, in the
 * order the categories were created. Empty categories are skipped, so a shelf appears by
 * itself as soon as its category is stocked.
 */
export const homeShelves = query({
  args: { perShelf: v.optional(v.number()), maxShelves: v.optional(v.number()) },
  handler: async (ctx, { perShelf = 5, maxShelves = 6 }) => {
    const take = Math.min(Math.max(1, Math.floor(perShelf)), 12);
    const cap = Math.min(Math.max(1, Math.floor(maxShelves)), 12);
    const categories = await ctx.db.query('categories').collect();
    const shelves: Array<{ slug: string; name: string; products: Array<Doc<'products'> & { imageUrl: string | undefined }> }> = [];
    for (const c of categories) {
      if (shelves.length >= cap) break;
      const items = await ctx.db
        .query('products')
        .withIndex('by_category', (q) => q.eq('categorySlug', c.slug))
        .filter((q) => q.eq(q.field('inStock'), true))
        .take(take);
      if (items.length === 0) continue;
      shelves.push({
        slug: c.slug,
        name: c.name,
        products: await Promise.all(
          items.map(async (p) => ({ ...p, imageUrl: await resolveImageUrl(ctx, p.imageStorageId, p.imageUrl) })),
        ),
      });
    }
    return shelves;
  },
});

export const listAll = query({
  args: {
    categorySlug: v.optional(v.string()),
    brandSlug: v.optional(v.string()),
    sort: v.optional(v.union(v.literal('featured'), v.literal('price-asc'), v.literal('price-desc'), v.literal('new'))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { categorySlug, brandSlug, sort = 'featured', limit = 60 }) => {
    let results = await ctx.db
      .query('products')
      .filter((q) => q.eq(q.field('inStock'), true))
      .collect();

    if (categorySlug) results = results.filter((p) => p.categorySlug === categorySlug);
    if (brandSlug) results = results.filter((p) => p.brandSlug === brandSlug);

    if (sort === 'price-asc') results.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') results.sort((a, b) => b.price - a.price);
    else if (sort === 'new') results.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));

    results = results.slice(0, limit);

    return Promise.all(
      results.map(async (p) => ({
        ...p,
        imageUrl: await resolveImageUrl(ctx, p.imageStorageId, p.imageUrl),
      }))
    );
  },
});

/** Products tagged with a given condition slug — excludes out-of-stock */
export const listByCondition = query({
  args: { conditionSlug: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { conditionSlug, limit = 20 }) => {
    const all = await ctx.db
      .query('products')
      .filter((q) => q.eq(q.field('inStock'), true))
      .collect();
    const filtered = all
      .filter((p) => p.conditions.includes(conditionSlug))
      .slice(0, limit);
    return Promise.all(
      filtered.map(async (p) => ({
        ...p,
        imageUrl: await resolveImageUrl(ctx, p.imageStorageId, p.imageUrl),
      }))
    );
  },
});

/** Products by brand slug — excludes out-of-stock */
export const listByBrand = query({
  args: { brandSlug: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { brandSlug, limit = 20 }) => {
    const all = await ctx.db
      .query('products')
      .filter((q) => q.eq(q.field('inStock'), true))
      .collect();
    const filtered = all
      .filter((p) => p.brandSlug === brandSlug)
      .slice(0, limit);
    return Promise.all(
      filtered.map(async (p) => ({
        ...p,
        imageUrl: await resolveImageUrl(ctx, p.imageStorageId, p.imageUrl),
      }))
    );
  },
});

/** Single product by slug — still shown even if OOS on detail page */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const product = await ctx.db
      .query('products')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .first();
    if (!product) return null;
    return {
      ...product,
      imageUrl: await resolveImageUrl(ctx, product.imageStorageId, product.imageUrl),
    };
  },
});

/** Hero featured products: 3 trending in-stock products */
export const listHeroFeatured = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query('products')
      .withIndex('by_trending', (q) => q.eq('isTrending', true))
      .filter((q) => q.eq(q.field('inStock'), true))
      .take(3);
    return Promise.all(
      products.map(async (p) => ({
        ...p,
        imageUrl: await resolveImageUrl(ctx, p.imageStorageId, p.imageUrl),
      }))
    );
  },
});

// ─── SEARCH ────────────────────────────────────────────────────────────────

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** Optimal-string-alignment edit distance (insert/delete/substitute/transpose), bails out above `max`. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev2: number[] = [];
  let prev: number[] = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur: number[] = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let d = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d = Math.min(d, prev2[j - 2] + 1);
      }
      cur[j] = d;
      if (d < rowMin) rowMin = d;
    }
    if (rowMin > max) return max + 1;
    for (let j = 0; j <= b.length; j++) prev2[j] = prev[j];
    prev = cur;
  }
  return prev[b.length];
}

function maxTypos(len: number): number {
  if (len <= 3) return 0;
  if (len <= 5) return 1;
  return 2;
}

/** Score one query token against one field's tokens (0 = no match). */
function scoreToken(q: string, fieldTokens: string[]): number {
  let best = 0;
  for (const t of fieldTokens) {
    let s = 0;
    if (t === q) s = 1;
    else if (q.length >= 2 && t.startsWith(q)) s = 0.85;
    else if (q.length >= 3 && t.includes(q)) s = 0.55;
    else {
      const allowed = maxTypos(q.length);
      if (allowed > 0) {
        // compare against the same-length prefix too so "amoxcil" still finds "amoxicillin"
        const d = Math.min(
          editDistance(q, t, allowed),
          t.length > q.length ? editDistance(q, t.slice(0, q.length), allowed) + 1 : allowed + 1
        );
        if (d <= allowed) s = 0.6 - 0.15 * d;
      }
    }
    if (s > best) best = s;
  }
  return best;
}

type SearchableProduct = {
  name: string[];
  brand: string[];
  generic: string[];
  category: string[];
  conditions: string[];
};

const FIELD_WEIGHT = { name: 5, brand: 3, generic: 4, category: 2, conditions: 2 } as const;

function scoreProduct(qTokens: string[], f: SearchableProduct, fullQuery: string, nameFull: string): number {
  let total = 0;
  for (const q of qTokens) {
    let best = 0;
    for (const key of Object.keys(FIELD_WEIGHT) as (keyof typeof FIELD_WEIGHT)[]) {
      const s = scoreToken(q, f[key]) * FIELD_WEIGHT[key];
      if (s > best) best = s;
    }
    if (best === 0) return 0; // every typed word has to match something
    total += best;
  }
  if (nameFull === fullQuery) total += 10;
  else if (nameFull.startsWith(fullQuery)) total += 5;
  else if (nameFull.includes(fullQuery)) total += 2;
  return total;
}

async function loadSearchData(ctx: { db: QueryCtx['db'] }) {
  const [products, conditions] = await Promise.all([
    ctx.db.query('products').collect() as Promise<Doc<'products'>[]>,
    ctx.db.query('conditions').collect() as Promise<Doc<'conditions'>[]>,
  ]);
  const conditionName = new Map<string, string>(conditions.map((c) => [c.slug, c.name]));
  const indexed = products.map((p) => ({
    product: p,
    nameFull: tokenize(p.name).join(' '),
    fields: {
      name: tokenize(p.name),
      brand: tokenize(p.brand),
      generic: tokenize(p.genericName),
      category: tokenize(p.category),
      conditions: tokenize(p.conditions.map((s) => conditionName.get(s) ?? s.replace(/-/g, ' ')).join(' ')),
    } as SearchableProduct,
  }));
  return indexed;
}

/** Ranked search across name, brand, generic name, category and conditions.
 *  Tolerates typos and partial words; excludes out-of-stock products. */
export const searchProducts = query({
  args: { term: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { term, limit = 20 }) => {
    const qTokens = tokenize(term);
    if (qTokens.length === 0) return [];
    const fullQuery = qTokens.join(' ');
    const indexed = await loadSearchData(ctx);
    const ranked = indexed
      .filter((i) => i.product.inStock)
      .map((i) => ({ p: i.product, score: scoreProduct(qTokens, i.fields, fullQuery, i.nameFull) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name))
      .slice(0, limit);
    return Promise.all(
      ranked.map(async ({ p }) => ({
        ...p,
        imageUrl: await resolveImageUrl(ctx, p.imageStorageId, p.imageUrl),
      }))
    );
  },
});

/** "Did you mean" — a corrected query when a typed word isn't a known word, otherwise null. */
export const searchSuggestion = query({
  args: { term: v.string() },
  handler: async (ctx, { term }) => {
    const qTokens = tokenize(term);
    if (qTokens.length === 0) return null;
    const indexed = await loadSearchData(ctx);
    const freq = new Map<string, number>();
    for (const i of indexed) {
      for (const key of ['name', 'brand', 'generic', 'category', 'conditions'] as const) {
        for (const t of i.fields[key]) if (t.length >= 3) freq.set(t, (freq.get(t) ?? 0) + 1);
      }
    }
    const vocab = [...freq.keys()];
    let changed = false;
    const corrected = qTokens.map((q) => {
      if (q.length < 4) return q;
      // known word or a prefix of one: leave as typed
      if (vocab.some((t) => t === q || t.startsWith(q))) return q;
      const allowed = maxTypos(q.length);
      let best: string | null = null;
      let bestD = allowed + 1;
      for (const t of vocab) {
        const d = editDistance(q, t, allowed);
        if (d < bestD || (d === bestD && best !== null && (freq.get(t) ?? 0) > (freq.get(best) ?? 0))) {
          best = t;
          bestD = d;
        }
      }
      if (best && bestD <= allowed) {
        changed = true;
        return best;
      }
      return q;
    });
    return changed ? corrected.join(' ') : null;
  },
});

// ─── MUTATIONS ─────────────────────────────────────────────────────────────

/** Generate a Convex upload URL for product images */
export const generateUploadUrl = internalMutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/** Save product */
export const upsertProduct = internalMutation({
  args: {
    slug: v.string(),
    name: v.string(),
    brand: v.string(),
    brandSlug: v.string(),
    genericName: v.string(),
    category: v.string(),
    categorySlug: v.string(),
    conditions: v.array(v.string()),
    classification: v.union(v.literal('OTC'), v.literal('P'), v.literal('POM')),
    form: v.string(),
    strength: v.string(),
    packSize: v.string(),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    description: v.string(),
    directions: v.string(),
    warnings: v.string(),
    ingredients: v.string(),
    imageStorageId: v.optional(v.id('_storage')),
    imageUrl: v.optional(v.string()),
    inStock: v.boolean(),
    stockQty: v.number(),
    sku: v.optional(v.string()),
    manufacturer: v.optional(v.string()),
    isNew: v.optional(v.boolean()),
    isTrending: v.optional(v.boolean()),
    isBestSeller: v.optional(v.boolean()),
    isOffer: v.optional(v.boolean()),
    rating: v.optional(v.number()),
    reviewCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('products')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert('products', args);
  },
});

/** One-off cleanup: remove fabricated rating/reviewCount placeholder data */
export const clearFakeRatings = internalMutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query('products').collect();
    let cleared = 0;
    for (const p of all) {
      if (p.rating !== undefined || p.reviewCount !== undefined) {
        await ctx.db.patch(p._id, { rating: undefined, reviewCount: undefined });
        cleared += 1;
      }
    }
    return { cleared };
  },
});

/** Update product stock */
export const updateStock = internalMutation({
  args: { slug: v.string(), stockQty: v.number(), inStock: v.boolean() },
  handler: async (ctx, { slug, stockQty, inStock }) => {
    const product = await ctx.db
      .query('products')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .first();
    if (!product) throw new Error(`Product not found: ${slug}`);
    await ctx.db.patch(product._id, { stockQty, inStock });
  },
});

// ─── ADMIN QUERIES & MUTATIONS ─────────────────────────────────────────────

export const adminListProducts = internalQuery({
  args: {
    category: v.optional(v.string()),
    stockStatus: v.optional(v.string()), // 'in_stock' | 'out_of_stock'
    classification: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const q = ctx.db.query('products').order('desc');
    let results = await q.collect();

    if (args.category) {
      results = results.filter((r) => r.category === args.category);
    }
    if (args.stockStatus === 'in_stock') {
      results = results.filter((r) => r.inStock === true);
    } else if (args.stockStatus === 'out_of_stock') {
      results = results.filter((r) => r.inStock === false);
    }
    if (args.classification) {
      results = results.filter((r) => r.classification === args.classification);
    }

    return results.slice(0, args.limit || 100);
  },
});

export const adminGetProductById = internalQuery({
  args: { id: v.id('products') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const adminCreateProduct = internalMutation({
  args: {
    slug: v.string(),
    name: v.string(),
    brand: v.string(),
    brandSlug: v.string(),
    genericName: v.string(),
    category: v.string(),
    categorySlug: v.string(),
    conditions: v.array(v.string()),
    classification: v.union(v.literal('OTC'), v.literal('P'), v.literal('POM')),
    form: v.string(),
    strength: v.string(),
    packSize: v.string(),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    description: v.string(),
    directions: v.string(),
    warnings: v.string(),
    ingredients: v.string(),
    imageStorageId: v.optional(v.id('_storage')),
    imageUrl: v.optional(v.string()),
    inStock: v.boolean(),
    stockQty: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert('products', args);
    await ctx.db.insert('auditLog', {
      action: 'CREATE_PRODUCT',
      targetType: 'product',
      targetId: id,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const adminUpdateProduct = internalMutation({
  args: {
    id: v.id('products'),
    updates: v.any(), // Record of updates matching schema
  },
  handler: async (ctx, { id, updates }) => {
    await ctx.db.patch(id, updates);
    await ctx.db.insert('auditLog', {
      action: 'UPDATE_PRODUCT',
      targetType: 'product',
      targetId: id,
      createdAt: Date.now(),
    });
  },
});

export const adminDeleteProduct = internalMutation({
  args: { id: v.id('products') },
  handler: async (ctx, { id }) => {
    // Instead of active=false, we set inStock=false to soft-hide it from clients since we can't change schema
    await ctx.db.patch(id, { inStock: false, stockQty: 0 });
    await ctx.db.insert('auditLog', {
      action: 'ARCHIVE_PRODUCT',
      targetType: 'product',
      targetId: id,
      createdAt: Date.now(),
    });
  },
});

export const bulkExportCsv = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('products').collect();
  }
});

