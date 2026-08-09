'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import type { Id } from '../../../../../../convex/_generated/dataModel';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { Button } from '@/components/admin/ui/Button';
import { Modal } from '@/components/admin/ui/Modal';
import { Textarea } from '@/components/admin/ui/Input';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { useAdminToast } from '@/components/admin/ui/Toast';

function formatKES(n: number) {
  return `KES ${n.toLocaleString()}`;
}

const FULFILLMENT_STEPS = ['placed', 'confirmed', 'packed', 'delivering', 'completed'] as const;

function nextStatus(status: string): (typeof FULFILLMENT_STEPS)[number] | null {
  const idx = FULFILLMENT_STEPS.indexOf(status as any);
  if (idx === -1 || idx === FULFILLMENT_STEPS.length - 1) return null;
  return FULFILLMENT_STEPS[idx + 1];
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const orderId = id as Id<'orders'>;
  const { toast } = useAdminToast();

  const data = useQuery(api.orders.getOrderById, { orderId });
  const updateFulfillment = useMutation(api.orders.updateFulfillmentStatus);
  const capturePayment = useMutation(api.orders.captureAuthorizedPayment);
  const markCod = useMutation(api.orders.markCodCollected);
  const cancelOrder = useMutation(api.orders.cancelOrder);
  const addNote = useMutation(api.orders.addOrderTimelineNote);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [restock, setRestock] = useState(true);
  const [refund, setRefund] = useState(false);
  const [noteText, setNoteText] = useState('');

  if (data === undefined) {
    return (
      <div className="pb-16 max-w-[998px] mx-auto">
        <PageHeader title="Loading order..." backUrl="/admin/orders" />
        <SkeletonLoader type="card" />
      </div>
    );
  }

  if (data === null || !data.order) {
    return (
      <div className="pb-16 max-w-[998px] mx-auto">
        <PageHeader title="Order not found" backUrl="/admin/orders" />
      </div>
    );
  }

  const { order, timeline } = data;
  const next = nextStatus(order.status);

  return (
    <div className="pb-16">
      <PageHeader
        title={order.orderNumber}
        subtitle={new Date(order._creationTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
        backUrl="/admin/orders"
        secondaryActions={
          order.status !== 'cancelled' && order.status !== 'completed'
            ? [{ label: 'Cancel order', onClick: () => setCancelOpen(true) }]
            : []
        }
        primaryAction={next ? {
          label: `Mark as ${next}`,
          onClick: async () => {
            await updateFulfillment({ orderId, newStatus: next, notifyCustomer: false });
            toast(`Order marked as ${next}`);
          },
        } : undefined}
      />

      <div className="grid lg:grid-cols-[2fr_1fr] gap-5 items-start max-w-[998px] mx-auto">
        <div className="space-y-5 min-w-0">
          <Card
            title={order.status === 'completed' ? 'Fulfilled' : `${order.status[0].toUpperCase()}${order.status.slice(1)} (${order.items.length} items)`}
            headerAction={<Badge status={order.status === 'completed' ? 'success' : order.status === 'cancelled' ? 'critical' : 'warning'}>{order.status}</Badge>}
          >
            <div className="space-y-3">
              {order.items.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-p-text">{item.name} × {item.qty}</p>
                  </div>
                  <p className="text-sm text-p-text">{formatKES(item.price * item.qty)}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card
            title={order.paymentStatus === 'paid' || order.paymentStatus === 'collected' ? 'Paid' : order.paymentStatus}
            headerAction={
              <Badge status={order.paymentStatus === 'paid' || order.paymentStatus === 'collected' ? 'success' : order.paymentStatus === 'pending' ? 'warning' : 'default'}>
                {order.paymentStatus}
              </Badge>
            }
          >
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-p-text-subdued">Subtotal · {order.items.length} items</span>
                <span>{formatKES(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-p-text-subdued">Delivery</span>
                <span>{formatKES(order.deliveryFee)}</span>
              </div>
              <div className="border-t border-p-border-subdued pt-2 flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>{formatKES(order.total)}</span>
              </div>
            </div>
            {order.paymentStatus === 'pending' && (
              <div className="mt-4">
                {order.paymentMethod === 'cod' ? (
                  <Button variant="primary" onClick={async () => { await markCod({ orderId }); toast('Marked as collected'); }}>
                    Mark COD collected
                  </Button>
                ) : (
                  <Button variant="primary" onClick={async () => { await capturePayment({ orderId }); toast('Payment captured'); }}>
                    Capture payment
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5 min-w-0">
          <Card title="Customer">
            <p className="text-sm font-medium text-p-focus">{order.customerName}</p>
            {order.customerEmail && <p className="text-sm text-p-text-subdued">{order.customerEmail}</p>}
            {order.customerPhone && <p className="text-sm text-p-text-subdued">{order.customerPhone}</p>}
            <div className="mt-3 pt-3 border-t border-p-border-subdued">
              <p className="text-[12px] uppercase tracking-wide font-semibold text-p-text-subdued mb-1">Delivery address</p>
              <p className="text-sm text-p-text">{order.deliveryAddress}</p>
            </div>
          </Card>

          <Card title="Timeline">
            <div className="space-y-3 mb-4">
              {(!timeline || timeline.length === 0) && (
                <p className="text-sm text-p-text-subdued">No activity yet.</p>
              )}
              {timeline?.map((event: any) => (
                <div key={event._id} className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-p-text-disabled mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-p-text">
                      {event.action.replace(/_/g, ' ').toLowerCase()}
                      {event.metadata?.body ? `: ${event.metadata.body}` : ''}
                    </p>
                    <p className="text-[13px] text-p-text-subdued">{new Date(event.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!noteText.trim()) return;
                await addNote({ orderId, body: noteText });
                setNoteText('');
                toast('Note added');
              }}
              className="flex gap-2"
            >
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Leave a comment..."
                className="h-9 flex-1 min-w-0 rounded px-3 text-sm border border-p-border-input focus:outline-none focus:shadow-[0_0_0_1px_var(--color-p-focus)]"
              />
              <Button type="submit" variant="secondary">Post</Button>
            </form>
          </Card>
        </div>
      </div>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel order"
        primaryAction={{
          label: 'Cancel order',
          destructive: true,
          onClick: async () => {
            await cancelOrder({ orderId, reason: cancelReason || 'No reason given', restock, refund });
            toast('Order cancelled');
            setCancelOpen(false);
          },
        }}
        secondaryAction={{ label: 'Keep order', onClick: () => setCancelOpen(false) }}
      >
        <Textarea
          label="Reason"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Why is this order being cancelled?"
        />
        <label className="flex items-center gap-2 mt-4 text-sm text-p-text">
          <input type="checkbox" checked={restock} onChange={(e) => setRestock(e.target.checked)} className="accent-[#0D9488]" />
          Restock items
        </label>
        <label className="flex items-center gap-2 mt-2 text-sm text-p-text">
          <input type="checkbox" checked={refund} onChange={(e) => setRefund(e.target.checked)} className="accent-[#0D9488]" />
          Refund payment
        </label>
      </Modal>
    </div>
  );
}
