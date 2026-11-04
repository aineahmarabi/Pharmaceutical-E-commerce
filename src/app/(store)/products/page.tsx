'use client';

import React, { Suspense, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toProduct } from '@/lib/adapters/product';
import { ListingView, RailGroup, RailOption, type ActiveChip } from '@/components/product/ListingView';
import { Skeleton } from '@/components/ui/Skeleton';
import { useMounted } from '@/hooks/useMounted';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'new', label: 'Newest' },
];

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const [sort, setSort] = useState('featured');
  const [activeCat, setActiveCat] = useState('all');
  const [activeBrand, setActiveBrand] = useState('all');

  const mounted = useMounted();
  const categoriesQuery = useQuery(api.taxonomy.listCategories, {});
  const brandsQuery = useQuery(api.brands.list, {});
  const categories = mounted ? categoriesQuery : undefined;
  const brands = mounted ? brandsQuery : undefined;
  const products = useQuery(api.products.listAll, {
    categorySlug: activeCat === 'all' ? undefined : activeCat,
    brandSlug: activeBrand === 'all' ? undefined : activeBrand,
    sort: sort as 'featured' | 'price-asc' | 'price-desc' | 'new',
    limit: 60,
  });

  const catName = categories?.find((c) => c.slug === activeCat)?.name ?? activeCat;
  const brandName = brands?.find((b) => b.slug === activeBrand)?.name ?? activeBrand;

  const chips: ActiveChip[] = [
    ...(activeCat !== 'all' ? [{ key: 'cat', label: catName, onRemove: () => setActiveCat('all') }] : []),
    ...(activeBrand !== 'all' ? [{ key: 'brand', label: brandName, onRemove: () => setActiveBrand('all') }] : []),
  ];

  const railTop = (
    <>
      <RailGroup title="Category">
        <div className="max-h-64 overflow-y-auto overscroll-contain space-y-0.5">
          <RailOption active={activeCat === 'all'} onClick={() => setActiveCat('all')}>All categories</RailOption>
          {categories === undefined
            ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 my-1" />)
            : categories.map((c) => (
                <RailOption key={c.slug} active={activeCat === c.slug} onClick={() => setActiveCat(c.slug)}>
                  {c.name}
                </RailOption>
              ))}
        </div>
      </RailGroup>
      <RailGroup title="Brand">
        <div className="max-h-64 overflow-y-auto overscroll-contain space-y-0.5">
          <RailOption active={activeBrand === 'all'} onClick={() => setActiveBrand('all')}>All brands</RailOption>
          {brands === undefined
            ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 my-1" />)
            : brands.map((b) => (
                <RailOption key={b.slug} active={activeBrand === b.slug} onClick={() => setActiveBrand(b.slug)}>
                  {b.name}
                </RailOption>
              ))}
        </div>
      </RailGroup>
    </>
  );

  return (
    <ListingView
      breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Products' }]}
      title="All products"
      products={products?.map(toProduct)}
      sort={{ value: sort, onChange: setSort, options: sortOptions }}
      railTop={railTop}
      hideBrandFilter
      externalChips={chips}
      onClearExternal={() => {
        setActiveCat('all');
        setActiveBrand('all');
      }}
      emptyTitle="No products match these filters"
      emptyDescription="Try fewer filters."
    />
  );
}
