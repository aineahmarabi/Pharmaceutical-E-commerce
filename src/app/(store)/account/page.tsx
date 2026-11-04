'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useCustomerAuth } from '@/lib/auth/customerAuth';
import { useWishlistStore } from '@/store/cart';
import { useBranding } from '@/hooks/useBranding';
import { formatPrice } from '@/lib/utils';
import { AccountFrame, primaryBtn, secondaryBtn } from './AccountFrame';
import { RefillDueCard, UpcomingReminders } from '@/components/account/RefillReminder';

const STATUS_LABEL: Record<string, string> = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  processing: 'Preparing',
  packed: 'Packed',
  shipped: 'On the way',
  dispatched: 'On the way',
  out_for_delivery: 'On the way',
  delivered: 'Delivered',
  completed: 'Delivered',
  cancelled: 'Cancelled',
};

function statusLabel(status: string) {
  return STATUS_LABEL[status] ?? status.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
}

function fmtDate(ms: number) {
  return new Date(ms).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

const card = 'rounded-xl border border-line bg-paper';

function Stat({ label, value, href }: { label: string; value: number | string; href: string }) {
  return (
    <Link
      href={href}
      className={`${card} group p-4 transition-colors hover:border-ink/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40`}
    >
      <span className="block text-2xl font-semibold tabular-nums tracking-tight text-ink">{value}</span>
      <span className="mt-0.5 flex items-center justify-between text-sm text-muted-fg">
        {label}
        <span aria-hidden className="transition-colors group-hover:text-ink">→</span>
      </span>
    </Link>
  );
}

function SignedOut() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <section className={`${card} p-5 sm:p-6`}>
          <h2 className="text-lg font-semibold tracking-tight text-ink">Sign in</h2>
          <p className="mt-1 text-sm text-muted-fg">See your orders, reorder in one tap and keep your addresses and wishlist.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/account/login" className={primaryBtn}>Log in</Link>
            <Link href="/account/signup" className={secondaryBtn}>Create account</Link>
          </div>
        </section>

        <section className={`${card} p-5 sm:p-6`}>
          <h2 className="text-lg font-semibold tracking-tight text-ink">Track an order</h2>
          <p className="mt-1 text-sm text-muted-fg">No account needed. Use your order number and phone number or email.</p>
          <div className="mt-5">
            <Link href="/account/orders" className={secondaryBtn}>Track order</Link>
          </div>
        </section>
      </div>

      <p className="text-sm text-muted-fg">
        You can also order as a guest at any time. An account just makes the next order faster.
      </p>
    </>
  );
}

function SignedIn() {
  const { customer, token } = useCustomerAuth();
  const branding = useBranding();
  const wishCount = useWishlistStore((s) => s.ids.size);
  const orders = useQuery(api.orders.listMyOrders, token ? { token } : 'skip');
  const addresses = useQuery(api.customerAddresses.list, token ? { token } : 'skip');

  const recent = (orders ?? []).slice(0, 3);
  const defaultAddress = addresses?.find((a) => a.isDefault) ?? addresses?.[0];
  const waHref = `https://wa.me/${String(branding.whatsapp).replace(/\D/g, '')}`;

  return (
    <>
      <RefillDueCard />

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Stat label="Orders" value={orders === undefined ? '–' : orders.length} href="/account/orders" />
        <Stat label="Wishlist" value={wishCount} href="/account/wishlist" />
        <Stat label="Addresses" value={addresses === undefined ? '–' : addresses.length} href="/account/addresses" />
      </div>

      <section className={card} aria-labelledby="recent-orders">
        <div className="flex items-baseline justify-between gap-4 border-b border-line px-4 py-3 sm:px-6">
          <h2 id="recent-orders" className="text-base font-semibold tracking-tight text-ink">Recent orders</h2>
          {recent.length > 0 && (
            <Link href="/account/orders" className="text-sm font-medium text-petrol hover:underline underline-offset-4">View all</Link>
          )}
        </div>

        {orders === undefined ? (
          <div className="space-y-3 p-4 sm:p-6" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-porcelain" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="px-4 py-10 text-center sm:px-6">
            <p className="text-base font-semibold text-ink">No orders yet</p>
            <p className="mt-1 text-sm text-muted-fg">When you order, it shows up here with live status.</p>
            <Link href="/products" className={`${primaryBtn} mt-5 inline-block`}>Start shopping</Link>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {recent.map((o) => (
              <li key={o._id}>
                <Link
                  href="/account/orders"
                  className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-porcelain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-petrol/40 sm:px-6"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">{o.orderNumber}</span>
                    <span className="block text-xs text-muted-fg">{fmtDate(o._creationTime)}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-4">
                    <span
                      className={`rounded-md border px-2 py-0.5 text-xs font-medium ${
                        o.status === 'cancelled' ? 'border-signal/40 text-signal' : 'border-line bg-porcelain text-ink'
                      }`}
                    >
                      {statusLabel(o.status)}
                    </span>
                    <span className="w-24 text-right text-sm font-semibold tabular-nums text-ink">{formatPrice(o.total)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <UpcomingReminders />

      <div className="grid gap-4 md:grid-cols-2">
        <section className={`${card} p-4 sm:p-6`} aria-labelledby="quick-actions">
          <h2 id="quick-actions" className="text-base font-semibold tracking-tight text-ink">Quick actions</h2>
          <ul className="mt-3 divide-y divide-line text-sm">
            {[
              { label: 'Send a prescription', href: '/prescription' },
              { label: 'Track an order', href: '/account/orders' },
              { label: 'Browse all products', href: '/products' },
            ].map((a) => (
              <li key={a.href}>
                <Link href={a.href} className="flex items-center justify-between py-2.5 text-ink hover:text-petrol">
                  {a.label}
                  <span aria-hidden className="text-muted-fg">→</span>
                </Link>
              </li>
            ))}
            <li>
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-2.5 text-ink hover:text-petrol">
                Ask a pharmacist on WhatsApp
                <span aria-hidden className="text-muted-fg">→</span>
              </a>
            </li>
          </ul>
        </section>

        <section className={`${card} p-4 sm:p-6`} aria-labelledby="delivery-address">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="delivery-address" className="text-base font-semibold tracking-tight text-ink">Delivery address</h2>
            <Link href="/account/addresses" className="text-sm font-medium text-petrol hover:underline underline-offset-4">
              {defaultAddress ? 'Manage' : 'Add'}
            </Link>
          </div>
          {addresses === undefined ? (
            <div className="mt-3 h-16 animate-pulse rounded-lg bg-porcelain" aria-busy="true" />
          ) : defaultAddress ? (
            <address className="mt-3 text-sm not-italic leading-relaxed text-ink">
              {[defaultAddress.label, defaultAddress.address, defaultAddress.city, defaultAddress.phone]
                .filter(Boolean)
                .map((line: string, i: number) => (
                  <span key={i} className={i === 0 ? 'block font-semibold' : 'block text-muted-fg'}>{line}</span>
                ))}
            </address>
          ) : (
            <p className="mt-3 text-sm text-muted-fg">Save an address to check out faster.</p>
          )}
        </section>
      </div>

      <p className="text-xs text-muted-fg">
        Signed in as {customer?.email}. Manage your details under <Link href="/account/profile" className="text-petrol underline underline-offset-2">Profile</Link>.
      </p>
    </>
  );
}

export default function AccountPage() {
  const { customer, isAuthenticated } = useCustomerAuth();
  const first = customer?.name?.split(' ')[0] ?? '';

  return (
    <AccountFrame title={isAuthenticated ? `Hello, ${first}` : 'Your account'}>
      {customer === undefined ? (
        <div className="space-y-4" aria-busy="true">
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-paper border border-line" />
            ))}
          </div>
          <div className="h-48 animate-pulse rounded-xl bg-paper border border-line" />
        </div>
      ) : isAuthenticated ? (
        <SignedIn />
      ) : (
        <SignedOut />
      )}
    </AccountFrame>
  );
}
