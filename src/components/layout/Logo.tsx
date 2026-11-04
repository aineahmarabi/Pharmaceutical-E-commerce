'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useBranding } from '@/hooks/useBranding';
import { BrandName } from '@/components/ui/BrandName';

const sizes = {
  sm: { box: 'h-7 w-7', img: 'h-7', name: 'text-base' },
  md: { box: 'h-9 w-9', img: 'h-9 sm:h-11', name: 'text-lg sm:text-xl' },
  lg: { box: 'h-10 w-10', img: 'h-11 sm:h-14', name: 'text-xl sm:text-2xl' },
} as const;

/** The admin-uploaded logo plus the brand name; with no uploaded logo, a typographic mark (accent square with a cross) is used instead. */
export function Logo({ size = 'md', className }: { size?: keyof typeof sizes; className?: string }) {
  const branding = useBranding();
  const s = sizes[size];
  return (
    <Link
      href="/"
      aria-label={`${branding.name} home`}
      className={cn(
        'group inline-flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40',
        className,
      )}
    >
      {branding.logo ? (
        // The logo uploaded by the admin (Settings > Branding) takes priority. It already
        // contains the brand name and sits directly on the page, with no box around it.
        // In dark mode a faint light outline keeps its black parts readable (see .brand-logo).
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={branding.logo}
          alt={branding.name}
          className={cn('brand-logo w-auto max-w-[14rem] shrink-0 object-contain', s.img)}
        />
      ) : (
        <>
          <span
            aria-hidden="true"
            className={cn('relative grid shrink-0 place-items-center rounded-[28%] bg-petrol transition-colors group-hover:bg-petrol-700', s.box)}
          >
            <span className="absolute h-[18%] w-[52%] rounded-full bg-white" />
            <span className="absolute h-[52%] w-[18%] rounded-full bg-white" />
          </span>
          <BrandName name={branding.name} className={cn('font-semibold tracking-tight text-ink', s.name)} />
        </>
      )}
    </Link>
  );
}
