import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating?: number;
  reviewCount?: number;
  size?: number;
  className?: string;
}

export function StarRating({ rating, reviewCount, size = 12, className }: StarRatingProps) {
  if (!rating) return null;
  const rounded = Math.round(rating * 2) / 2;

  return (
    <div className={cn('flex items-center gap-1', className)} aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= rounded;
          const half = !filled && i + 0.5 === rounded;
          return (
            <Star
              key={i}
              size={size}
              className={cn(filled || half ? 'text-ink' : 'text-line')}
              fill={filled ? 'currentColor' : 'none'}
              strokeWidth={1.75}
            />
          );
        })}
      </div>
      <span className="text-xs text-muted-fg tabular-nums">
        {rating.toFixed(1)}
        {typeof reviewCount === 'number' && ` (${reviewCount})`}
      </span>
    </div>
  );
}
