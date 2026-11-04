'use client';

import Link from 'next/link';
import type { FaqItem } from '@/lib/content/faq';
import { usePharmacyDetails } from '@/components/layout/PharmacyDetails';

export function FaqAnswer({ item }: { item: FaqItem }) {
  const { licence } = usePharmacyDetails();
  // {{licence}} in the FAQ text becomes " (licence no. ...)", or nothing when no number is set.
  const fill = (t: string) => t.replaceAll('{{licence}}', licence ? ` (licence no. ${licence})` : '');
  const ListTag = item.steps ? 'ol' : 'ul';
  return (
    <div className="mt-2 max-w-3xl space-y-3 pr-8 text-sm leading-relaxed text-ink/80">
      {item.a.map((p, i) => (
        <p key={i}>{fill(p)}</p>
      ))}
      {item.list && (
        <ListTag
          className={`space-y-1.5 pl-5 marker:text-muted-fg ${item.steps ? 'list-decimal' : 'list-disc'}`}
        >
          {item.list.map((li, i) => (
            <li key={i}>{fill(li)}</li>
          ))}
        </ListTag>
      )}
      {item.after && <p>{fill(item.after)}</p>}
      {item.link && (
        <p>
          <Link href={item.link.href} className="font-medium text-petrol underline underline-offset-2">
            {item.link.label}
          </Link>
        </p>
      )}
    </div>
  );
}
