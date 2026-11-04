'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { ArrowRight } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { categories as fixtureCategories } from '@/lib/fixtures/categories';
import { ProductImagePlaceholder } from '@/components/ui/ProductImagePlaceholder';
import { SectionHeader } from '@/components/sections/SectionHeader';

function NeedTile({ slug, name, index }: { slug: string; name: string; index: number }) {
  const products = useQuery(api.products.listByCategory, { categorySlug: slug, limit: 6 });
  const thumbs = (products ?? []).filter((p) => p.imageUrl).slice(0, 3);

  return (
    <li>
      <Link
        href={`/category/${slug}`}
        className="group flex h-full min-h-44 flex-col justify-between rounded-xl border border-line bg-paper p-5 transition-[border-color,box-shadow,transform] duration-100 hover:border-petrol hover:shadow-sm active:scale-[0.98]"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="text-xl font-semibold leading-tight tracking-tight text-ink">{name}</span>
          <span className="text-xs tabular-nums text-muted-fg">{String(index + 1).padStart(2, '0')}</span>
        </div>
        <div className="mt-6 flex items-end justify-between">
          <div className="flex -space-x-2">
            {thumbs.map((p) => (
              <ProductImagePlaceholder
                key={p._id}
                className="h-12 w-12 rounded-lg border border-line ring-2 ring-paper"
                aspectRatio=""
                size="sm"
                name={p.name}
                categorySlug={p.categorySlug}
                imageUrl={p.imageUrl}
              />
            ))}
          </div>
          <ArrowRight size={16} className="text-muted-fg transition-colors group-hover:text-petrol" />
        </div>
      </Link>
    </li>
  );
}

export function NeedTiles() {
  const live = useQuery(api.taxonomy.listCategories, {});
  const cats = (live && live.length > 0 ? live : fixtureCategories).slice(0, 8);

  return (
    <section aria-labelledby="need-heading">
      <SectionHeader id="need-heading" title="Shop by need" href="/products" linkLabel="All products" />
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cats.map((c, i) => (
          <NeedTile key={c.slug} slug={c.slug} name={c.name} index={i} />
        ))}
      </ul>
    </section>
  );
}
