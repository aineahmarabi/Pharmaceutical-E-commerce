'use client';

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useCustomerAuth } from '@/lib/auth/customerAuth';
import Link from 'next/link';
import { BuyAgainButton } from '@/components/account/BuyAgainButton';
import { RefillReminderButton } from '@/components/account/RefillReminder';
import { AccountFrame, accountField, primaryBtn } from '../AccountFrame';
import { CopyOrderNumber } from '@/components/ui/CopyOrderNumber';
import { useBranding } from '@/hooks/useBranding';
import { readDeviceOrders, type DeviceOrderRef } from '@/lib/deviceOrders';

const STATUS_LABELS: Record<string, string> = {
  placed: 'Order placed',
  confirmed: 'Confirmed',
  packed: 'Packed',
  delivering: 'Out for delivery',
  completed: 'Delivered',
  cancelled: 'Cancelled',
};

const STEPS = ['placed', 'confirmed', 'packed', 'delivering', 'completed'] as const;

function StatusChip({ status }: { status: string }) {
  const cancelled = status === 'cancelled';
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${cancelled ? 'border-signal text-signal' : 'border-line bg-porcelain text-ink'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function StatusTimeline({ status }: { status: string }) {
  if (status === 'cancelled') return <p className="text-sm text-signal">This order was cancelled.</p>;
  const idx = STEPS.indexOf(status as (typeof STEPS)[number]);
  return (
    <ol className="grid grid-cols-5 gap-1" aria-label="Order progress">
      {STEPS.map((s, i) => {
        const done = i <= idx;
        return (
          <li key={s} className="flex flex-col gap-2" aria-current={i === idx ? 'step' : undefined}>
            <span className={`h-1 rounded-full ${done ? 'bg-ink' : 'bg-line'}`} />
            <span className={`text-xs leading-tight ${done ? 'text-ink font-medium' : 'text-muted-fg'}`}>{STATUS_LABELS[s]}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** Opens WhatsApp with a ready, polite message about this order, so the pharmacy can see which one to hurry. */
function NudgeOnWhatsApp({ orderNumber, status, total, placedAt, items }: { orderNumber: string; status: string; total: number; placedAt: number; items?: { name: string; qty: number }[] }) {
  const branding = useBranding();
  const number = String(branding.whatsapp ?? '').replace(/\D/g, '');
  if (!number || status === 'completed' || status === 'cancelled') return null;
  const lines = [
    `Hello ${branding.name}, I am following up on my order ${orderNumber}.`,
    `Placed ${fmtDate(placedAt)} · KES ${total.toLocaleString()} · currently "${STATUS_LABELS[status] ?? status}".`,
    ...(items && items.length ? [`Items: ${items.map((i) => `${i.name} × ${i.qty}`).join(', ')}.`] : []),
    'If it is possible, kindly speed it up, as it is fairly urgent for me. Thank you for your help.',
  ];
  const text = encodeURIComponent(lines.join('\n'));
  const phone = String(branding.phone ?? '').replace(/[^0-9+]/g, '');
  const pill =
    'inline-flex h-9 items-center rounded-lg border border-line bg-paper px-3 text-sm font-medium text-ink transition-colors hover:border-petrol hover:text-petrol active:scale-[0.97]';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-fg">Need it urgently?</span>
      <a href={`https://wa.me/${number}?text=${text}`} target="_blank" rel="noopener noreferrer" className={pill}>
        WhatsApp
      </a>
      {phone && (
        <>
          <a href={`sms:${phone}?body=${text}`} className={pill}>SMS</a>
          <a href={`tel:${phone}`} className={pill}>Call</a>
        </>
      )}
    </div>
  );
}

const fmtDate = (t: number) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function OrdersPage() {
  const { isAuthenticated, token } = useCustomerAuth();
  const myOrders = useQuery(api.orders.listMyOrders, token ? { token } : 'skip');

  // Orders this device placed as a guest: no account or order number needed to follow them.
  const [deviceRefs, setDeviceRefs] = useState<DeviceOrderRef[]>([]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads localStorage, which is not available during server render
    setDeviceRefs(readDeviceOrders());
  }, []);
  const deviceOrders = useQuery(
    api.orders.trackOnDevice,
    !isAuthenticated && deviceRefs.length ? { refs: deviceRefs.map((r) => ({ orderId: r.orderId, phone: r.phone })) } : 'skip',
  );

  const [orderNumber, setOrderNumber] = useState('');
  const [contact, setContact] = useState('');
  type TrackResult = Awaited<ReturnType<typeof trackOrder>>;
  const trackOrder = useMutation(api.orders.trackOrder);
  const [submitted, setSubmitted] = useState<{ orderNumber: string; contact: string } | null>(null);
  const [result, setResult] = useState<TrackResult | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() && !contact.trim()) return;
    const next = { orderNumber, contact };
    setSubmitted(next);
    setResult(undefined);

    // An order number on its own is only honoured on the device (or account) that placed the order.
    if (orderNumber.trim() && !contact.trim()) {
      const norm = (x: string) => x.toLowerCase().replace(/[\s#]/g, '');
      const typed = norm(orderNumber);
      const mine =
        deviceOrders?.find((o) => norm(o.orderNumber) === typed) ??
        myOrders?.map((o) => ({ orderNumber: o.orderNumber, status: o.status, paymentStatus: o.paymentStatus, total: o.total, createdAt: o._creationTime })).find((o) => norm(o.orderNumber) === typed);
      setResult(
        mine
          ? { found: true as const, mode: 'status' as const, orders: [{ orderNumber: mine.orderNumber, status: mine.status, paymentStatus: mine.paymentStatus, total: mine.total, createdAt: mine.createdAt }] }
          : { found: false as const, error: 'That order is not on this device. Add the phone number or email you ordered with to look it up.' },
      );
      return;
    }
    trackOrder(next)
      .then(setResult)
      .catch(() => setResult({ found: false as const, error: 'Something went wrong. Please try again.' }));
  };

  return (
    <AccountFrame
      title={isAuthenticated ? 'Orders' : 'Track your order'}
    >
      {isAuthenticated && (
        <div className="space-y-4">
          {myOrders === undefined ? (
            <div className="h-24 bg-paper border border-line rounded-xl animate-pulse" />
          ) : myOrders.length === 0 ? (
            <div className="bg-paper border border-line rounded-xl p-6 sm:p-8">
              <p className="font-semibold text-ink">No orders</p>
            </div>
          ) : (
            myOrders.map((order) => (
              <div key={order._id} className="bg-paper border border-line rounded-xl p-4 sm:p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CopyOrderNumber value={order.orderNumber} />
                    <p className="text-sm text-muted-fg mt-0.5">
                      {fmtDate(order._creationTime)} · <span className="tabular-nums">KES {order.total.toLocaleString()}</span>
                    </p>
                  </div>
                  <StatusChip status={order.status} />
                </div>
                <StatusTimeline status={order.status} />
                <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
                  <NudgeOnWhatsApp orderNumber={order.orderNumber} status={order.status} total={order.total} placedAt={order._creationTime} items={order.items} />
                  <BuyAgainButton items={order.items} />
                  <RefillReminderButton orderId={order._id} />
                  <Link href={`/account/orders/${order._id}`} className="text-sm font-medium text-petrol hover:underline">Details</Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="bg-paper border border-line rounded-xl p-4 sm:p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">{isAuthenticated ? 'Track a guest order' : 'Track order'}</h2>
          <p className="mt-0.5 text-sm text-muted-fg">The order number alone works on the device you ordered from. On another device, add the phone or email you used.</p>
        </div>
        <div>
          <label htmlFor="trk-no" className="block text-sm font-medium text-ink mb-1.5">Order number</label>
          <input id="trk-no" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="e.g. ian001" className={accountField} />
        </div>
        <div>
          <label htmlFor="trk-contact" className="block text-sm font-medium text-ink mb-1.5">Phone number or email</label>
          <input id="trk-contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Used at checkout" className={accountField} />
        </div>
        <button type="submit" className={`${primaryBtn} w-full`}>Track order</button>
      </form>
      {!isAuthenticated && deviceOrders && deviceOrders.length > 0 && (
        <section aria-labelledby="device-orders" className="space-y-3">
          <h2 id="device-orders" className="text-lg font-semibold tracking-tight text-ink">Your orders on this device</h2>
          {deviceOrders.map((order) => (
            <div key={order._id} className="space-y-4 rounded-xl border border-line bg-paper p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CopyOrderNumber value={order.orderNumber} className="text-base" />
                  <p className="mt-0.5 text-sm text-muted-fg">
                    {fmtDate(order.createdAt)} · <span className="tabular-nums">KES {order.total.toLocaleString()}</span>
                    {order.paymentStatus === 'paid' && ' · Paid'}
                    {order.paymentStatus === 'pending' && order.paymentMethod === 'paystack' && order.status !== 'cancelled' && ' · Awaiting payment'}
                  </p>
                </div>
                <StatusChip status={order.status} />
              </div>
              <StatusTimeline status={order.status} />
              <NudgeOnWhatsApp orderNumber={order.orderNumber} status={order.status} total={order.total} placedAt={order.createdAt} />
            </div>
          ))}
        </section>
      )}
      </div>

      {submitted && (
        <div>
          {result === undefined ? (
            <p className="text-sm text-muted-fg py-6">Looking up your order…</p>
          ) : !result.found ? (
            <div role="alert" className="bg-paper border border-signal rounded-xl p-4">
              <p className="text-sm text-signal font-medium">{result.error}</p>
            </div>
          ) : result.mode === 'status' ? (
            <div className="space-y-3">
              {result.orders.map((o) => (
                <div key={o.orderNumber} className="space-y-4 rounded-xl border border-line bg-paper p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CopyOrderNumber value={o.orderNumber} className="text-base" />
                      <p className="mt-0.5 text-sm text-muted-fg">
                        {fmtDate(o.createdAt)} · <span className="tabular-nums">KES {o.total.toLocaleString()}</span>
                        {o.paymentStatus === 'paid' && ' · Paid'}
                      </p>
                    </div>
                    <StatusChip status={o.status} />
                  </div>
                  <StatusTimeline status={o.status} />
                  <NudgeOnWhatsApp orderNumber={o.orderNumber} status={o.status} total={o.total} placedAt={o.createdAt} />
                </div>
              ))}
              <p className="text-xs text-muted-fg">Add your phone or email and the order number together to see the items and delivery details.</p>
            </div>
          ) : (
            <div className="bg-paper border border-line rounded-xl p-4 sm:p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CopyOrderNumber value={result.order.orderNumber} className="text-lg" />
                  <p className="text-sm text-muted-fg mt-0.5">Placed {fmtDate(result.order._creationTime)}</p>
                </div>
                <StatusChip status={result.order.status} />
              </div>

              <StatusTimeline status={result.order.status} />
              <NudgeOnWhatsApp orderNumber={result.order.orderNumber} status={result.order.status} total={result.order.total} placedAt={result.order._creationTime} items={result.order.items} />

              <div className="border-t border-line pt-4 space-y-2">
                {result.order.items.map((item, i) => (
                  <div key={i} className="flex justify-between gap-4 text-sm">
                    <span className="text-ink">{item.name} × {item.qty}</span>
                    <span className="text-ink tabular-nums">KES {(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-semibold border-t border-line pt-2 mt-2 text-ink">
                  <span>Total</span>
                  <span className="tabular-nums">KES {result.order.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-line pt-4">
                <p className="text-xs font-medium text-muted-fg mb-1">Delivery address</p>
                <p className="text-sm text-ink">{result.order.deliveryAddress}</p>
              </div>

              {result.timeline && result.timeline.length > 0 && (
                <div className="border-t border-line pt-4">
                  <p className="text-xs font-medium text-muted-fg mb-3">Activity</p>
                  <ol className="space-y-3 border-l border-line ml-1">
                    {result.timeline.map((event) => (
                      <li key={event._id} className="pl-4 relative">
                        <span className="absolute -left-[3px] top-1.5 w-1.5 h-1.5 rounded-full bg-ink" aria-hidden />
                        <p className="text-sm text-ink capitalize">{event.action.replace(/_/g, ' ').toLowerCase()}</p>
                        <p className="text-xs text-muted-fg">{new Date(event.createdAt).toLocaleString()}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </AccountFrame>
  );
}
