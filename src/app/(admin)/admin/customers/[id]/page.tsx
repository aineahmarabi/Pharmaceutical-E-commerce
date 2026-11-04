'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminApi';
import { api } from '../../../../../../convex/_generated/api';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { Button } from '@/components/admin/ui/Button';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { useAdminToast } from '@/components/admin/ui/Toast';

function formatKES(n: number) {
  return `KES ${Math.round(n).toLocaleString()}`;
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const customerId = decodeURIComponent(id);
  const { toast } = useAdminToast();

  const data = useAdminQuery(api.customers.getCustomerById, { customerId });
  const addTag = useAdminMutation(api.customers.addTag);
  const removeTag = useAdminMutation(api.customers.removeTag);
  const addNote = useAdminMutation(api.customers.updateCustomerNotes);

  const [tagInput, setTagInput] = useState('');
  const [noteInput, setNoteInput] = useState('');

  if (data === undefined) {
    return (
      <div className="pb-16">
        <PageHeader title="Loading customer..." backUrl="/admin/customers" />
        <SkeletonLoader type="card" />
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="pb-16">
        <PageHeader title="Customer not found" backUrl="/admin/customers" />
      </div>
    );
  }

  const { customer, orders, tags, notes } = data;
  const lastOrder = orders.length > 0 ? [...orders].sort((a, b) => b._creationTime - a._creationTime)[0] : null;

  const inputCls = 'h-9 flex-1 min-w-0 rounded-lg px-3 text-sm bg-p-bg-surface text-p-text border border-p-border-input focus:outline-none focus:shadow-[0_0_0_1px_var(--color-p-focus)] disabled:opacity-50';
  const fmtDate = (t: number) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="pb-16">
      <PageHeader title={customer.name || 'Unknown customer'} subtitle={customer.email || customer.phone} backUrl="/admin/customers" />

      <div className="grid lg:grid-cols-[2fr_1fr] gap-4 items-start">
        <div className="space-y-4 min-w-0">
          <Card title="Overview">
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Amount spent', value: formatKES(customer.totalSpent) },
                { label: 'Orders', value: String(customer.totalOrders) },
                { label: 'Average order', value: formatKES(customer.aov) },
                { label: 'Last order', value: lastOrder ? fmtDate(customer.lastOrderDate) : '—' },
              ].map((row) => (
                <div key={row.label}>
                  <dt className="text-xs text-p-text-subdued">{row.label}</dt>
                  <dd className="text-base font-semibold text-p-text tabular-nums mt-0.5">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card title="Order history" padding="compact">
            {orders.length === 0 ? (
              <p className="text-sm text-p-text-subdued py-6 text-center">This customer has not placed any orders yet.</p>
            ) : (
              <div className="-m-3.5 mt-0 overflow-x-auto">
                <table className="w-full min-w-[420px]">
                  <thead>
                    <tr className="h-9 text-xs font-semibold text-p-text-subdued border-b border-p-border-subdued bg-p-bg">
                      <th className="text-left px-5">Order</th>
                      <th className="text-left px-3">Date</th>
                      <th className="text-left px-3">Status</th>
                      <th className="text-right px-5">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o._id} className="h-11 border-b border-p-border-subdued last:border-0 text-sm hover:bg-p-bg transition-colors">
                        <td className="px-5"><Link href={`/admin/orders/${o._id}`} className="font-medium text-p-focus hover:underline">{o.orderNumber}</Link></td>
                        <td className="px-3 text-p-text-subdued whitespace-nowrap">{fmtDate(o._creationTime)}</td>
                        <td className="px-3"><Badge status={o.status === 'completed' ? 'success' : 'warning'}>{o.status}</Badge></td>
                        <td className="px-5 text-right font-medium tabular-nums">{formatKES(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card title="Notes">
            <div className="space-y-3 mb-4">
              {notes.length === 0 && <p className="text-sm text-p-text-subdued">No notes yet.</p>}
              {notes.map((n) => (
                <div key={n._id} className="text-sm border-l-2 border-p-border-subdued pl-3">
                  <p className="text-p-text">{n.body}</p>
                  <p className="text-xs text-p-text-subdued mt-0.5">{n.authorName} · {new Date(n.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!noteInput.trim()) return;
                await addNote({ customerId, note: noteInput });
                setNoteInput('');
                toast('Note added');
              }}
              className="flex gap-2"
            >
              <input
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Add a note..."
                aria-label="Add a note"
                className={inputCls}
              />
              <Button type="submit" variant="secondary">Post</Button>
            </form>
          </Card>
        </div>

        <div className="space-y-4 min-w-0">
          <Card title="Customer">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-p-text-subdued">Name</dt>
                <dd className="text-p-text font-medium">{customer.name || 'Unknown'}</dd>
              </div>
              <div>
                <dt className="text-xs text-p-text-subdued">Email</dt>
                <dd className="text-p-text break-all">{customer.email || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-p-text-subdued">Phone</dt>
                <dd className="text-p-text">{customer.phone || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-p-text-subdued">Address</dt>
                <dd className="text-p-text whitespace-pre-line">{customer.address || 'No address on file.'}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Tags">
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.length === 0 && <p className="text-sm text-p-text-subdued">No tags.</p>}
              {tags.map((tag: string) => (
                <span key={tag} className="inline-flex items-center gap-1 bg-p-bg text-p-text border border-p-border-subdued text-xs rounded-md px-2 py-1">
                  {tag}
                  <button onClick={() => removeTag({ customerId, tag })} aria-label={`Remove tag ${tag}`} className="text-p-text-subdued hover:text-p-critical">×</button>
                </span>
              ))}
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!tagInput.trim()) return;
                await addTag({ customerId, tag: tagInput.trim() });
                setTagInput('');
              }}
              className="flex gap-2"
            >
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag"
                aria-label="Add tag"
                className={inputCls}
              />
              <Button type="submit" variant="secondary">Add</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
