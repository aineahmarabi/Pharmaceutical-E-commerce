'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { Skeleton, RowSkeleton } from '@/components/ui/Skeleton';
import { useCustomerAuth } from '@/lib/auth/customerAuth';
import { BuyAgainButton } from '@/components/account/BuyAgainButton';
import { RefillReminderButton } from '@/components/account/RefillReminder';
import { AccountFrame } from '../../AccountFrame';

const STATUS_LABELS: Record<string, string> = {
  placed: 'Order placed',
  confirmed: 'Confirmed',
  packed: 'Packed',
  delivering: 'Out for delivery',
  completed: 'Delivered',
  cancelled: 'Cancelled',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token, isAuthenticated } = useCustomerAuth();
  const order = useQuery(api.orders.getMyOrder, token && id ? { token, orderId: id } : 'skip');

  return (
    <AccountFrame
      title="Order details"
      actions={<Link href="/account/orders" className="text-sm text-petrol font-medium hover:underline">Back to orders</Link>}
    >
      {!isAuthenticated ? (
        <div className="bg-paper rounded-xl border border-line p-4 sm:p-6">
          <p className="text-sm text-ink">Sign in to see this order.</p>
          <Link href="/account/login" className="mt-3 inline-block text-sm font-medium text-petrol hover:underline">Sign in</Link>
        </div>
      ) : order === undefined ? (
        <div className="bg-paper rounded-xl border border-line p-4 sm:p-6 space-y-3">
          <Skeleton className="h-4 w-20" />
          {Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)}
        </div>
      ) : order === null ? (
        <div className="bg-paper rounded-xl border border-line p-4 sm:p-6">
          <p className="text-sm text-ink">Order not found.</p>
        </div>
      ) : (
        <div className="bg-paper rounded-xl border border-line p-4 sm:p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-ink">{order.orderNumber}</p>
              <p className="text-sm text-muted-fg mt-0.5">
                {new Date(order._creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {STATUS_LABELS[order.status] ?? order.status}
              </p>
            </div>
            <BuyAgainButton items={order.items} />
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
            <RefillReminderButton orderId={order._id} />
          </div>
          <div className="border-t border-line pt-4 space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between gap-4 text-sm">
                <span className="text-ink">{item.name} × {item.qty}</span>
                <span className="text-ink tabular-nums">KES {(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm text-muted-fg pt-2"><span>Delivery</span><span className="tabular-nums">KES {order.deliveryFee.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm font-semibold border-t border-line pt-2 text-ink">
              <span>Total</span><span className="tabular-nums">KES {order.total.toLocaleString()}</span>
            </div>
          </div>
          <div className="border-t border-line pt-4">
            <p className="text-xs font-medium text-muted-fg mb-1">Delivery address</p>
            <p className="text-sm text-ink">{order.deliveryAddress}</p>
          </div>
        </div>
      )}
    </AccountFrame>
  );
}
