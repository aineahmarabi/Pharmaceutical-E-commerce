'use client';

import React, { useEffect, useState } from 'react';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

export interface LegalSection {
  heading: string;
  body: string[];
  /** Optional bullet list, rendered after the paragraphs. */
  list?: string[];
  /** Optional closing paragraphs, rendered after the list/table. */
  after?: string[];
  table?: { head: string[]; rows: string[][] };
}

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/** White header card with breadcrumb + title, shared by all information pages. */
export function PageHeader({
  crumb,
  title,
  description,
  meta,
}: {
  crumb: string;
  title: string;
  description?: string;
  meta?: string;
}) {
  return (
    <header className="bg-paper border border-line rounded-xl px-4 py-3 sm:px-6">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: crumb }]} />
      <h1 className="mt-1.5 text-xl sm:text-2xl font-semibold tracking-tight text-ink">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-fg">{description}</p>}
      {meta && <p className="mt-1 text-xs text-muted-fg">{meta}</p>}
    </header>
  );
}

export function LegalPage({
  eyebrow,
  title,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  sections: LegalSection[];
}) {
  const ids = sections.map((s) => slugify(s.heading));
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-96px 0px -60% 0px' },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections.length]);

  return (
    <div className="min-h-screen bg-porcelain py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <PageHeader crumb={title} title={title} meta={`Updated ${updated}`} />

        <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-4 lg:items-start">
          <nav aria-label="On this page" className="hidden lg:block sticky top-28 bg-paper border border-line rounded-xl p-4">
            <p className="text-xs font-semibold text-ink mb-2">On this page</p>
            <ol className="space-y-0.5">
              {sections.map((s, i) => {
                const id = ids[i];
                const isActive = active === id;
                return (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      aria-current={isActive ? 'location' : undefined}
                      className={`block rounded-lg px-2 py-1.5 text-sm transition-colors ${
                        isActive ? 'bg-porcelain text-ink font-medium' : 'text-muted-fg hover:text-ink'
                      }`}
                    >
                      {s.heading}
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>

          <article className="bg-paper border border-line rounded-xl p-4 sm:p-8 mt-4 lg:mt-0">
            <div className="max-w-3xl space-y-7">
              {sections.map((section, i) => (
                <section key={section.heading} id={ids[i]} className="scroll-mt-28">
                  <h2 className="text-lg font-semibold tracking-tight text-ink mb-2">
                    <span className="text-muted-fg tabular-nums mr-2">{i + 1}.</span>
                    {section.heading}
                  </h2>
                  <div className="space-y-3">
                    {section.body.map((p, j) => (
                      <p key={j} className="text-sm leading-relaxed text-ink/80">{p}</p>
                    ))}
                  </div>
                  {section.list && (
                    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink/80 marker:text-muted-fg">
                      {section.list.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.table && (
                    <div className="mt-4 overflow-x-auto rounded-lg border border-line">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-porcelain text-xs text-muted-fg">
                          <tr>
                            {section.table.head.map((h) => (
                              <th key={h} scope="col" className="px-4 py-2.5 font-semibold">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                          {section.table.rows.map((r) => (
                            <tr key={r.join('|')}>
                              {r.map((c, k) => (
                                <td key={k} className={`px-4 py-3 align-top ${k === 0 ? 'font-medium text-ink' : 'text-ink/80'}`}>{c}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {section.after && (
                    <div className="mt-3 space-y-3">
                      {section.after.map((p, j) => (
                        <p key={j} className="text-sm leading-relaxed text-ink/80">{p}</p>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
