'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { toProduct } from '@/lib/adapters/product';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SectionHeader } from '@/components/sections/SectionHeader';

/**
 * One shelf for every category that has products in stock. A category with nothing in stock
 * shows no shelf, and it appears on its own as soon as it is stocked.
 */
export function NeedShelves() {
  const shelves = useQuery(api.products.homeShelves, { perShelf: 5, maxShelves: 6 });
  if (!shelves) return null;

  return (
    <>
      {shelves.map((shelf) => (
        <section key={shelf.slug} aria-label={shelf.name}>
          <SectionHeader title={shelf.name} href={`/category/${shelf.slug}`} />
          <ProductGrid products={shelf.products.map(toProduct)} columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" />
        </section>
      ))}
    </>
  );
}
