import Link from 'next/link';
import { allFaqs, homeFaqQuestions } from '@/lib/content/faq';
import { FaqAnswer } from '@/components/ui/FaqAnswer';

export function Faq() {
  const items = homeFaqQuestions
    .map((q) => allFaqs.find((f) => f.q === q))
    .filter((f): f is NonNullable<typeof f> => Boolean(f));

  return (
    <section className="rounded-xl border border-line bg-paper p-4 sm:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="border-l-4 border-petrol pl-3 text-lg font-bold tracking-tight text-ink">FAQ</h2>
        <Link href="/faq" className="text-sm font-medium text-petrol underline-offset-4 hover:underline">
          All questions
        </Link>
      </div>
      <div className="mt-3 divide-y divide-line">
        {items.map((f) => (
          <details key={f.q} className="group py-3">
            <summary className="cursor-pointer list-none text-sm font-semibold text-ink">{f.q}</summary>
            <FaqAnswer item={f} />
          </details>
        ))}
      </div>
    </section>
  );
}
