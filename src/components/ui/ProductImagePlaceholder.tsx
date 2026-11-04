'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ProductImagePlaceholderProps {
  className?: string;
  /** Tailwind aspect class for the tile (every card uses the same one, so cards match in height). */
  aspectRatio?: string;
  size?: 'sm' | 'md' | 'lg';
  name?: string;
  categorySlug?: string;
  imageUrl?: string;
  /**
   * Framed mode (product cards): a fixed-size tile that always shows the WHOLE photo
   * (never cropped). Any space left by the photo's own shape is filled with a soft,
   * blurred version of the same photo instead of empty white, so every card is the
   * same height and the tile still looks full.
   */
  framed?: boolean;
}

function initialsFor(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Product photography sits on a white tile (bg-white is intentional and does not flip in
 * dark mode: pack shots are cut out on white). Photos are never cropped.
 */
export function ProductImagePlaceholder({
  className,
  aspectRatio = 'aspect-square',
  size = 'md',
  name,
  imageUrl,
  framed = false,
}: ProductImagePlaceholderProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (imageUrl && failedUrl !== imageUrl) {
    if (framed) {
      return (
        <div className={cn('relative w-full overflow-hidden bg-white', aspectRatio, className)}>
          {/* Soft backdrop: the same photo, enlarged and blurred, fills the leftover space. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full scale-125 object-cover opacity-70 blur-2xl"
          />
          {/* The photo itself: whole, uncropped, centred. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={name ?? ''}
            loading="lazy"
            onError={() => setFailedUrl(imageUrl)}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      );
    }

    return (
      <div className={cn('relative overflow-hidden bg-white', aspectRatio, className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={name ?? ''}
          loading="lazy"
          onError={() => setFailedUrl(imageUrl)}
          className="absolute inset-0 h-full w-full object-contain p-1 mix-blend-multiply"
        />
      </div>
    );
  }

  const textSizes = { sm: 'text-lg', md: 'text-3xl', lg: 'text-4xl' };
  return (
    <div className={cn('relative flex items-center justify-center overflow-hidden bg-porcelain', aspectRatio, className)}>
      <span className={cn('select-none font-semibold tracking-tight text-muted-fg/60', textSizes[size])} aria-hidden="true">
        {name ? initialsFor(name) : ''}
      </span>
    </div>
  );
}
