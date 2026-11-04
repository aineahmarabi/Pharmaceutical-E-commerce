'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toProduct } from '@/lib/adapters/product';
import { ListingView } from '@/components/product/ListingView';

function SearchContent() {
  const params = useSearchParams();
  const query = params.get('q') ?? '';
  const trimmed = query.trim();
  const products = useQuery(api.products.searchProducts, { term: query, limit: 48 });
  const suggestion = useQuery(api.products.searchSuggestion, trimmed ? { term: query } : 'skip');

  const hasResults = !!products && products.length > 0;
  const suggestionLink = suggestion ? (
    <Link href={`/search?q=${encodeURIComponent(suggestion)}`} className="font-semibold text-petrol hover:underline underline-offset-2">
      {suggestion}
    </Link>
  ) : null;

  return (
    <>
      {suggestion && products !== undefined && (
        <div className="mx-auto max-w-7xl px-4 pt-4 text-sm text-ink sm:px-6 lg:px-8" role="status">
          {hasResults ? <>Showing results for {suggestionLink}</> : <>Did you mean {suggestionLink}?</>}
        </div>
      )}
      <ListingView
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Search' }]}
        title={query ? `Results for “${query}”` : 'Search'}
        products={query ? products?.map(toProduct) : []}
        emptyTitle={query ? `No products found for “${query}”` : 'Search for a product'}
        emptyDescription={query ? 'Check the spelling.' : 'Type a medicine or brand.'}
      />
    </>
  );
}

export default function SearchPage() {
  return <Suspense fallback={null}><SearchContent /></Suspense>;
}
