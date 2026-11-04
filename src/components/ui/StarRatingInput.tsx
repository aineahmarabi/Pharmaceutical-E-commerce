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
    <div className={cn('flex items-center gap-1', className)} onMouseLeave={() => setHovered(0)} role="radiogroup" aria-label="Your rating">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === starValue}
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHovered(starValue)}
            className="p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40"
            aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
          >
            <Star
              size={size}
              className="text-gold"
              fill={starValue <= display ? 'currentColor' : 'none'}
              strokeWidth={1.75}
            />
          </button>
        );
      })}
    </div>
  );
}
