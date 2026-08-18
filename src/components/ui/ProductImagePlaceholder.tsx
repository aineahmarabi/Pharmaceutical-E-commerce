import React from 'react';
import { cn } from '@/lib/utils';

interface ProductImagePlaceholderProps {
  className?: string;
  aspectRatio?: string;
  size?: 'sm' | 'md' | 'lg';
  name?: string;
  categorySlug?: string;
  imageUrl?: string;
}

const CATEGORY_GRADIENTS: Record<string, [string, string]> = {
  'pain-relief': ['#3B82C4', '#0D9488'],
  antibiotics: ['#0D9488', '#22C55E'],
  'cough-cold': ['#3B82C4', '#5EEAD4'],
  'baby-care': ['#F9A8D4', '#F59E0B'],
  'skin-care': ['#FDA4AF', '#FED7AA'],
  'arthritis-joint-care': ['#EF4444', '#F59E0B'],
  'sexual-wellness': ['#334155', '#0F766E'],
  'mother-baby': ['#F9A8D4', '#0D9488'],
  allergy: ['#22C55E', '#5EEAD4'],
  'vitamins-supplements': ['#F59E0B', '#22C55E'],
  'digestive-health': ['#F59E0B', '#FDBA74'],
  cardiovascular: ['#EF4444', '#F59E0B'],
  'anti-infective': ['#0D9488', '#3B82C4'],
  antimalarial: ['#22C55E', '#0D9488'],
  antifungal: ['#3B82C4', '#0D9488'],
  respiratory: ['#5EEAD4', '#3B82C4'],
};

const DEFAULT_GRADIENT: [string, string] = ['#0D9488', '#0F766E'];

function initialsFor(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function ProductImagePlaceholder({
  className,
  aspectRatio = 'aspect-[4/3]',
  size = 'md',
  name,
  categorySlug,
  imageUrl,
}: ProductImagePlaceholderProps) {
  const iconSizes = { sm: 24, md: 40, lg: 56 };
  const iconSize = iconSizes[size];

  if (imageUrl) {
    return (
      <div className={cn('relative overflow-hidden bg-porcelain', aspectRatio, className)}>
        <img
          src={imageUrl}
          alt={name ?? ''}
          className="ghost-float-hover absolute inset-0 w-full h-full object-contain"
        />
      </div>
    );
  }

  if (name) {
    const [from, to] = (categorySlug && CATEGORY_GRADIENTS[categorySlug]) || DEFAULT_GRADIENT;
    const textSizes = { sm: 'text-base', md: 'text-2xl', lg: 'text-3xl' };
    return (
      <div
        className={cn('flex items-center justify-center overflow-hidden', aspectRatio, className)}
        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      >
        <span className={cn('font-display font-bold text-white/90 tracking-wide select-none', textSizes[size])}>
          {initialsFor(name)}
        </span>
      </div>
    );
  }

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
        <rect x="6" y="18" width="36" height="12" rx="6" stroke="#0D9488" strokeWidth="2.5" fill="none" />
        <rect x="6" y="18" width="18" height="12" rx="6" fill="#0D9488" fillOpacity="0.3" />
        <line x1="24" y1="18" x2="24" y2="30" stroke="#0D9488" strokeWidth="1.5" />
        <circle cx="37" cy="12" r="4" fill="#5EEAD4" fillOpacity="0.4" />
        <circle cx="11" cy="36" r="3" fill="#5EEAD4" fillOpacity="0.3" />
      </svg>
    </div>
  );
}
