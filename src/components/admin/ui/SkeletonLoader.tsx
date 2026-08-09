import React from 'react';
import { cn } from '@/lib/utils';

export function SkeletonLoader({
  type = 'text',
  count = 1,
  className,
}: {
  type?: 'text' | 'title' | 'thumbnail' | 'card';
  count?: number;
  className?: string;
}) {
  const base = 'bg-[#E4E5E7] rounded animate-pulse';

  if (type === 'title') {
    return <div className={cn(base, 'h-5 w-2/5 mb-4', className)} />;
  }

  if (type === 'thumbnail') {
    return <div className={cn(base, 'w-10 h-10 rounded', className)} />;
  }

  if (type === 'card') {
    return <div className={cn(base, 'h-32 w-full rounded-xl', className)} />;
  }

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(base, 'h-3.5 mb-2', i === count - 1 && count > 1 ? 'w-3/5' : 'w-full')}
        />
      ))}
    </div>
  );
}
