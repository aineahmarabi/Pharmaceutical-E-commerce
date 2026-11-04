import React from 'react';
import Link from 'next/link';

/** Title, a hairline rule, then an optional link. The shared section-header style. */
export function SectionHeader({ id, title, href, linkLabel = 'View all' }: { id?: string; title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-4 flex items-center gap-4">
      <h2 id={id} className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{title}</h2>
      <span aria-hidden="true" className="h-px flex-1 bg-line" />
      {href && (
        <Link href={href} className="shrink-0 text-sm font-medium text-petrol underline-offset-4 hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
