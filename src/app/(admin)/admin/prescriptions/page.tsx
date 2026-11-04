'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { Card } from '@/components/admin/ui/Card';
import { Badge, type BadgeStatus } from '@/components/admin/ui/Badge';
import { Tabs } from '@/components/admin/ui/Tabs';
import { Button } from '@/components/admin/ui/Button';
import { Textarea } from '@/components/admin/ui/Input';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { cn } from '@/lib/utils';

type RxStatus = 'pending' | 'approved' | 'rejected' | 'needs_info';

const STATUS_LABEL: Record<RxStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  needs_info: 'Needs info',
};
const STATUS_BADGE: Record<RxStatus, BadgeStatus> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'critical',
  needs_info: 'info',
};

function formatDate(ts: number) {
  return new Date(ts).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function useAdminToken() {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read localStorage after mount to avoid hydration mismatch
    setToken(localStorage.getItem('adminToken') || '');
  }, []);
  return token;
}

function Detail({ id, token, onClose }: { id: Id<'prescriptions'>; token: string; onClose: () => void }) {
  const rx = useQuery(api.prescriptions.get, { token, id });
  const updateStatus = useMutation(api.prescriptions.updateStatus);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState<RxStatus | null>(null);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset note when selected prescription changes
    setNote(rx?.pharmacistNote ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rx?._id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (zoom) setZoom(null);
      else onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [zoom, onClose]);

  const act = async (status: RxStatus) => {
    setError('');
    if ((status === 'rejected' || status === 'needs_info') && !note.trim()) {
      setError('Add a note for the customer first.');
      return;
    }
    setBusy(status);
    try {
      await updateStatus({ token, id, status, pharmacistNote: note.trim() || undefined });
    } catch (e) {
      const m = e instanceof Error ? e.message.match(/Uncaught Error:\s*([^\n]+)/) : null;
      setError(m ? m[1] : 'Could not update. Try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Prescription detail">
      <button aria-label="Close" className="absolute inset-0 bg-black/40" onClick={onClose} tabIndex={-1} />
      <div className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto bg-p-bg-surface shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-p-border-subdued bg-p-bg-surface px-5 py-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-p-text">{rx ? rx.reference : 'Prescription'}</h2>
            {rx && <p className="text-xs text-p-text-subdued">{formatDate(rx.createdAt)}</p>}
          </div>
          <div className="flex items-center gap-3">
            {rx && <Badge status={STATUS_BADGE[rx.status]}>{STATUS_LABEL[rx.status]}</Badge>}
            <Button size="sm" onClick={onClose}>Close</Button>
          </div>
        </div>

        {rx === undefined ? (
          <div className="p-5"><SkeletonLoader type="text" count={5} /></div>
        ) : rx === null ? (
          <p className="p-5 text-sm text-p-text-subdued">Prescription not found.</p>
        ) : (
          <div className="space-y-5 p-5">
            <section>
              <h3 className="mb-2 text-sm font-semibold text-p-text">Customer</h3>
              <dl className="grid grid-cols-[6rem_1fr] gap-y-1.5 text-sm">
                <dt className="text-p-text-subdued">Name</dt>
                <dd className="text-p-text">{rx.customerName}</dd>
                <dt className="text-p-text-subdued">Phone</dt>
                <dd><a href={`tel:${rx.phone.replace(/\s+/g, '')}`} className="text-p-text-primary hover:underline">{rx.phone}</a></dd>
                {rx.email && (<>
                  <dt className="text-p-text-subdued">Email</dt>
                  <dd className="break-all"><a href={`mailto:${rx.email}`} className="text-p-text-primary hover:underline">{rx.email}</a></dd>
                </>)}
                {rx.fulfillment && (<>
                  <dt className="text-p-text-subdued">Receive</dt>
                  <dd className="text-p-text">
                    {rx.fulfillment === 'pickup'
                      ? 'Pickup from the store'
                      : <>Delivery{rx.deliveryArea ? `, ${rx.deliveryArea}` : ''}{rx.address ? <span className="block text-p-text-subdued">{rx.address}</span> : null}</>}
                  </dd>
                </>)}
                {rx.notes && (<>
                  <dt className="text-p-text-subdued">Notes</dt>
                  <dd className="whitespace-pre-line text-p-text">{rx.notes}</dd>
                </>)}
                {rx.reviewedBy && rx.reviewedAt && (<>
                  <dt className="text-p-text-subdued">Reviewed</dt>
                  <dd className="text-p-text">{rx.reviewedBy}, {formatDate(rx.reviewedAt)}</dd>
                </>)}
              </dl>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold text-p-text">Files ({rx.files.length})</h3>
              <ul className="grid grid-cols-2 gap-3">
                {rx.files.map((f, i) => {
                  const isImage = f.contentType?.startsWith('image/');
                  if (!f.url) return <li key={f.id} className="text-sm text-p-text-subdued">File unavailable</li>;
                  return (
                    <li key={f.id}>
                      {isImage ? (
                        <button
                          onClick={() => setZoom(f.url!)}
                          aria-label={`View file ${i + 1} full size`}
                          className="block aspect-[3/4] w-full overflow-hidden rounded-lg border border-p-border-subdued bg-p-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p-focus"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={f.url} alt={`Prescription file ${i + 1}`} className="h-full w-full object-cover" />
                        </button>
                      ) : (
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex aspect-[3/4] w-full items-center justify-center rounded-lg border border-p-border-subdued bg-p-bg text-sm font-medium text-p-text-primary hover:underline"
                        >
                          Open PDF
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>

            <section>
              <Textarea
                label="Note to customer"
                helpText="Required to reject or request info. Shown to the customer when they check status."
                rows={3}
                maxLength={1000}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              {error && <p className="mt-2 text-sm text-[#B91C1C]" role="alert">{error}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="primary" loading={busy === 'approved'} disabled={busy !== null} onClick={() => act('approved')}>Approve</Button>
                <Button loading={busy === 'needs_info'} disabled={busy !== null} onClick={() => act('needs_info')}>Request info</Button>
                <Button variant="destructive" loading={busy === 'rejected'} disabled={busy !== null} onClick={() => act('rejected')}>Reject</Button>
              </div>
            </section>
          </div>
        )}
      </div>

      {zoom && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-label="Full size image" onClick={() => setZoom(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoom} alt="Prescription full size" className="max-h-full max-w-full object-contain" />
          <button className="absolute right-4 top-4 rounded-lg bg-p-bg-surface px-3 py-1.5 text-sm font-medium text-p-text" onClick={() => setZoom(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default function AdminPrescriptionsPage() {
  const token = useAdminToken();
  const all = useQuery(api.prescriptions.list, token ? { token } : 'skip');
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected' | 'needs_info' | 'all'>('pending');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<Id<'prescriptions'> | null>(null);

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0, needs_info: 0, all: 0 };
    for (const r of all ?? []) {
      c[r.status]++;
      c.all++;
    }
    return c;
  }, [all]);

  const rows = useMemo(() => {
    const s = search.trim().toLowerCase();
    const digits = s.replace(/[^0-9]/g, '');
    return (all ?? []).filter((r) => {
      if (tab !== 'all' && r.status !== tab) return false;
      if (!s) return true;
      return (
        r.reference.toLowerCase().includes(s) ||
        r.customerName.toLowerCase().includes(s) ||
        (digits.length > 0 && r.phone.replace(/[^0-9]/g, '').includes(digits))
      );
    });
  }, [all, tab, search]);

  return (
    <div className="pb-16">
      <PageHeader title="Prescriptions" />

      <Card padding="compact" className="overflow-hidden">
        <div className="-m-4">
          <Tabs
            activeTab={tab}
            onChange={(id) => setTab(id as typeof tab)}
            tabs={[
              { id: 'pending', label: 'Pending', badge: counts.pending },
              { id: 'approved', label: 'Approved', badge: counts.approved },
              { id: 'rejected', label: 'Rejected', badge: counts.rejected },
              { id: 'needs_info', label: 'Needs info', badge: counts.needs_info },
              { id: 'all', label: 'All', badge: counts.all },
            ]}
          />
          <div className="border-b border-p-border-subdued p-3">
            <label htmlFor="rx-search" className="sr-only">Search prescriptions</label>
            <input
              id="rx-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, name or phone"
              className="h-9 w-full rounded-lg border border-p-border-input bg-p-bg-surface px-3 text-sm text-p-text placeholder:text-p-text-subdued focus:border-p-focus focus:outline-none focus:ring-2 focus:ring-p-focus/30"
            />
          </div>

          {all === undefined ? (
            <div className="p-4"><SkeletonLoader type="text" count={5} /></div>
          ) : rows.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="text-base font-semibold text-p-text">No prescriptions</h3>
              <p className="mt-1 text-sm text-p-text-subdued">{search ? 'Nothing matches your search.' : 'Uploads from the storefront appear here.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-p-border-subdued text-xs text-p-text-subdued">
                    <th scope="col" className="px-4 py-2.5 font-medium">Reference</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">Customer</th>
                    <th scope="col" className="hidden px-4 py-2.5 font-medium sm:table-cell">Phone</th>
                    <th scope="col" className="hidden px-4 py-2.5 font-medium md:table-cell">Files</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-p-border-subdued">
                  {rows.map((r) => (
                    <tr key={r._id} className="transition-colors hover:bg-p-bg-surface-hover">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setOpenId(r._id)}
                          className={cn('rounded font-semibold tabular-nums text-p-text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p-focus')}
                        >
                          {r.reference}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-p-text">{r.customerName}</td>
                      <td className="hidden px-4 py-3 text-p-text sm:table-cell">{r.phone}</td>
                      <td className="hidden px-4 py-3 tabular-nums text-p-text md:table-cell">{r.fileCount}</td>
                      <td className="px-4 py-3"><Badge status={STATUS_BADGE[r.status]}>{STATUS_LABEL[r.status]}</Badge></td>
                      <td className="whitespace-nowrap px-4 py-3 text-p-text-subdued">{formatDate(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {openId && token && <Detail id={openId} token={token} onClose={() => setOpenId(null)} />}
    </div>
  );
}
