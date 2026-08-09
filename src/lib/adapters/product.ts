import type { Doc } from '../../../convex/_generated/dataModel';
import type { Product } from '@/lib/fixtures/types';

/**
 * Convex products carry resolved `imageUrl` (from either imageStorageId or the
 * plain field) — see resolveImageUrl() in convex/products.ts. This adapter maps
 * that document shape onto the existing fixtures Product type so ProductCard,
 * useCartStore, useWishlistStore, and checkout keep working unmodified while
 * consuming live Convex data instead of fixtures.
 */
export function toProduct(doc: Doc<'products'> & { imageUrl?: string }): Product {
  return {
    id: doc._id,
    slug: doc.slug,
    name: doc.name,
    brand: doc.brand,
    brandSlug: doc.brandSlug,
    genericName: doc.genericName,
    category: doc.category,
    categorySlug: doc.categorySlug,
    conditions: doc.conditions,
    classification: doc.classification,
    form: doc.form,
    strength: doc.strength,
    packSize: doc.packSize,
    price: doc.price,
    compareAtPrice: doc.compareAtPrice,
    description: doc.description,
    directions: doc.directions,
    warnings: doc.warnings,
    ingredients: doc.ingredients,
    inStock: doc.inStock,
    stockQty: doc.stockQty,
    isNew: doc.isNew,
    isTrending: doc.isTrending,
    isBestSeller: doc.isBestSeller,
    isOffer: doc.isOffer,
    rating: doc.rating,
    reviewCount: doc.reviewCount,
    manufacturer: doc.manufacturer,
    sku: doc.sku,
    imageUrl: doc.imageUrl,
  };
}
