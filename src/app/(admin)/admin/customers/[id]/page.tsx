'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { Button } from '@/components/admin/ui/Button';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { useAdminToast } from '@/components/admin/ui/Toast';
import { ShoppingCart } from 'lucide-react';

function formatKES(n: number) {
  return `KES ${Math.round(n).toLocaleString()}`;
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const customerId = decodeURIComponent(id);
  const { toast } = useAdminToast();

  const data = useQuery(api.customers.getCustomerById, { customerId });
  const staff = useQuery(api.staff.listStaff);
  const addTag = useMutation(api.customers.addTag);
  const removeTag = useMutation(api.customers.removeTag);
  const addNote = useMutation(api.customers.updateCustomerNotes);

  const [tagInput, setTagInput] = useState('');
  const [noteInput, setNoteInput] = useState('');

  if (data === undefined || staff === undefined) {
    return (
      <div className="pb-16 max-w-[998px] mx-auto">
        <PageHeader title="Loading customer..." backUrl="/admin/customers" />
        <SkeletonLoader type="card" />
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="pb-16 max-w-[998px] mx-auto">
        <PageHeader title="Customer not found" backUrl="/admin/customers" />
      </div>
    );
  }

  const { customer, orders, tags, notes } = data;
  const lastOrder = orders.length > 0 ? [...orders].sort((a, b) => b._creationTime - a._creationTime)[0] : null;
  const activeStaff = staff.find((s) => s.active);

  return (
    <div className="pb-16">
      <PageHeader title={customer.name || 'Unknown customer'} subtitle={customer.email || customer.phone} backUrl="/admin/customers" />

      <div className="grid lg:grid-cols-[2fr_1fr] gap-5 items-start max-w-[998px] mx-auto">
        <div className="space-y-5 min-w-0">
          <Card title="Last order">
            {lastOrder ? (
              <div className="flex items-center justify-between">
                <div>
                  <Link href={`/admin/orders/${lastOrder._id}`} className="font-medium text-p-focus">{lastOrder.orderNumber}</Link>
                  <p className="text-sm text-p-text-subdued mt-0.5">
                    {new Date(lastOrder._creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-p-text">{formatKES(lastOrder.total)}</p>
                  <Badge status={lastOrder.status === 'completed' ? 'success' : 'warning'}>{lastOrder.status}</Badge>
                </div>
              </div>
            ) : (
              <EmptyState icon={ShoppingCart} heading="No orders yet" body="This customer hasn't placed any orders yet." />
            )}
          </Card>

          <Card title="Order history">
            {orders.length === 0 ? (
              <p className="text-sm text-p-text-subdued">No orders.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((o: any) => (
                  <Link key={o._id} href={`/admin/orders/${o._id}`} className="flex items-center justify-between py-2 border-b border-p-border-subdued last:border-0">
                    <span className="text-sm text-p-focus">{o.orderNumber}</span>
                    <span className="text-sm text-p-text-subdued">{new Date(o._creationTime).toLocaleDateString()}</span>
                    <span className="text-sm font-medium">{formatKES(o.total)}</span>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card title="Notes">
            <div className="space-y-3 mb-4">
              {notes.length === 0 && <p className="text-sm text-p-text-subdued">No notes yet.</p>}
              {notes.map((n: any) => (
                <div key={n._id} className="text-sm">
                  <p className="text-p-text">{n.body}</p>
                  <p className="text-[13px] text-p-text-subdued">{n.authorName} · {new Date(n.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!noteInput.trim() || !activeStaff) return;
                await addNote({ customerId, note: noteInput, authorId: activeStaff._id });
                setNoteInput('');
                toast('Note added');
              }}
              className="flex gap-2"
            >
              <input
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Add a note..."
                disabled={!activeStaff}
                className="h-9 flex-1 min-w-0 rounded px-3 text-sm border border-p-border-input focus:outline-none focus:shadow-[0_0_0_1px_var(--color-p-focus)] disabled:opacity-50"
              />
              <Button type="submit" variant="secondary" disabled={!activeStaff}>Post</Button>
            </form>
          </Card>
        </div>

        <div className="space-y-5 min-w-0">
          <Card title="Customer overview">
            <div className="space-y-0">
              {[
                { label: 'Total spent', value: formatKES(customer.totalSpent) },
                { label: 'Total orders', value: String(customer.totalOrders) },
                { label: 'Average order value', value: formatKES(customer.aov) },
                { label: 'Last order', value: new Date(customer.lastOrderDate).toLocaleDateString() },
              ].map((row, i, arr) => (
                <div key={row.label} className={`flex justify-between py-2 ${i < arr.length - 1 ? 'border-b border-p-border-subdued' : ''}`}>
                  <span className="text-sm text-p-text-subdued">{row.label}</span>
                  <span className="text-sm font-semibold text-p-text">{row.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Address">
            <p className="text-sm text-p-text whitespace-pre-line">{customer.address || 'No address on file.'}</p>
          </Card>

          <Card title="Tags">
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.length === 0 && <p className="text-sm text-p-text-subdued">No tags.</p>}
              {tags.map((tag: string) => (
                <span key={tag} className="inline-flex items-center gap-1 bg-[#E4E5E7] text-p-text text-[13px] rounded px-2 py-1">
                  {tag}
                  <button onClick={() => removeTag({ customerId, tag })} className="text-p-text-subdued hover:text-p-critical">×</button>
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
                className="h-8 flex-1 min-w-0 rounded px-2 text-sm border border-p-border-input focus:outline-none focus:shadow-[0_0_0_1px_var(--color-p-focus)]"
              />
              <Button type="submit" variant="secondary" size="sm">Add</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
