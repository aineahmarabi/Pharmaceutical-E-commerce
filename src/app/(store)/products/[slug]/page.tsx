'use client';

import React from 'react';
import Link from 'next/link';
import { ProductCardSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function ProductDetailPage() {
  return (
    <div className="min-h-screen bg-porcelain">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 mb-6">
          <Skeleton className="h-3 w-12" /><Skeleton className="h-3 w-3" /><Skeleton className="h-3 w-20" /><Skeleton className="h-3 w-3" /><Skeleton className="h-3 w-32" />
        </div>
        <div className="grid md:grid-cols-[55fr_45fr] gap-10 bg-paper rounded-2xl border border-line p-6 sm:p-8">
          <div>
            <Skeleton className="aspect-square rounded-2xl mb-3" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="w-16 h-16 rounded-xl" />)}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
        <div className="mt-8 bg-paper rounded-2xl border border-line p-6">
          <div className="flex gap-6 border-b border-line pb-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-4 w-20" />)}
          </div>
          <div className="space-y-2 max-w-3xl">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
        <div className="mt-10">
          <Skeleton className="h-6 w-40 mb-5" />
          <div className="flex gap-4 overflow-x-auto pb-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="flex-shrink-0 w-52"><ProductCardSkeleton /></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
