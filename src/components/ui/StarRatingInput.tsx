'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  size?: number;
  className?: string;
}

export function StarRatingInput({ value, onChange, size = 22, className }: StarRatingInputProps) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className={cn('flex items-center gap-1', className)} onMouseLeave={() => setHovered(0)}>
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHovered(starValue)}
            className="p-0.5 transition-transform hover:scale-110"
            aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
          >
            <Star
              size={size}
              className={starValue <= display ? 'text-signal' : 'text-line'}
              fill={starValue <= display ? 'currentColor' : 'none'}
              strokeWidth={1.75}
            />
          </button>
        );
      })}
    </div>
  );
}
