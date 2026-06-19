import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div className={cn('skeleton-shimmer rounded-xl', className)} style={style} />
  );
}

export function ProductCardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-paper rounded-2xl border border-line overflow-hidden', className)}>
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="pt-2">
          <Skeleton className="h-5 w-1/3" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-paper rounded-2xl border border-line p-5', className)}>
      <div className="flex justify-between items-start mb-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-28 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function ChartSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-2xl overflow-hidden', className)}>
      <div className="flex items-end gap-2 px-4 pt-4 pb-0 h-40">
        {[65, 40, 75, 55, 80, 60, 90, 50, 70, 45, 85, 65].map((h, i) => (
          <Skeleton key={i} className="flex-1 rounded-t-lg rounded-b-none" style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="flex justify-between px-4 py-2">
        {['J','F','M','A','M','J','J','A','S','O','N','D'].map((m) => (
          <Skeleton key={m} className="h-3 w-3" />
        ))}
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function RowSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('flex items-center gap-3 py-2', className)}>
      <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-2.5 w-1/3" />
      </div>
      <Skeleton className="h-4 w-16 flex-shrink-0" />
    </div>
  );
}

export function SearchResultSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  );
}
