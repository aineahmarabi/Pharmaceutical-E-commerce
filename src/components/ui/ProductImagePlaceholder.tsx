import React from 'react';
import { cn } from '@/lib/utils';

interface ProductImagePlaceholderProps {
  className?: string;
  aspectRatio?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProductImagePlaceholder({
  className,
  aspectRatio = 'aspect-[4/3]',
  size = 'md',
}: ProductImagePlaceholderProps) {
  const iconSizes = { sm: 24, md: 40, lg: 56 };
  const iconSize = iconSizes[size];

  return (
    <div className={cn('bg-petrol-50 flex items-center justify-center overflow-hidden', aspectRatio, className)}>
      {/* Capsule SVG icon */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        className="opacity-25"
      >
        <rect x="6" y="18" width="36" height="12" rx="6" stroke="#0E4D45" strokeWidth="2.5" fill="none" />
        <rect x="6" y="18" width="18" height="12" rx="6" fill="#0E4D45" fillOpacity="0.3" />
        <line x1="24" y1="18" x2="24" y2="30" stroke="#0E4D45" strokeWidth="1.5" />
        <circle cx="37" cy="12" r="4" fill="#5FA89C" fillOpacity="0.4" />
        <circle cx="11" cy="36" r="3" fill="#5FA89C" fillOpacity="0.3" />
      </svg>
    </div>
  );
}
