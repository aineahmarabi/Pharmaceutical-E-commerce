'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAction } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { cn } from '@/lib/utils';

type View = 'checking' | 'paid' | 'pending' | 'failed' | 'problem' | 'none';
const PENDING_KEY = 'pc-pending-payment';
const MAX_CHECKS = 12; // M-PESA prompts can take a minute: check every 5 seconds for a while

const btn =
  'inline-flex h-11 items-center justify-center rounded-lg px-6 text-sm font-semibold transition-colors duration-100 active:scale-[0.97] disabled:opacity-60';

function readPending(): { orderId: Id<'orders'>; phone: string } | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as { orderId: Id<'orders'>; phone: string }) : null;
  } catch {
    return null;
  }
}

function Complete() {
  const params = useSearchParams();
  const reference = params.get('reference') ?? params.get('trxref') ?? '';
  const verify = useAction(api.paystack.verifyPayment);
  const startPayment = useAction(api.paystack.startPayment);

  const [view, setView] = useState<View>(reference ? 'checking' : 'none');
  const [orderNumber, setOrderNumber] = useState('');
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState('');
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (!reference) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    (async () => {
      try {
        const out = await verify({ reference });
        if (cancelled) return;
        if (out.orderNumber) setOrderNumber(out.orderNumber);
        if (out.state === 'paid') {
          try { sessionStorage.removeItem(PENDING_KEY); } catch { /* nothing to clear */ }
          setView('paid');
        } else if (out.state === 'pending' || out.state === 'unknown') {
          setView('pending');
          if (round < MAX_CHECKS) timer = setTimeout(() => setRound((r) => r + 1), 5000);
        } else if (out.state === 'failed') {
          setView('failed');
        } else {
          setView('problem');
        }
      } catch {
        if (!cancelled) setView('pending');
      }
    })();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [reference, verify, round]);

  const retry = useCallback(async () => {
    const pending = readPending();
    if (!pending) {
      setError('We could not find your order on this device. Contact us and we will help you pay.');
      return;
    }
    setRetrying(true);
    setError('');
    try {
      const { url } = await startPayment({
        orderId: pending.orderId,
        phone: pending.phone,
        callbackUrl: `${window.location.origin}/checkout/complete`,
      });
      window.location.assign(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the payment.');
      setRetrying(false);
    }
  }, [startPayment]);

  const hasRetry = view === 'failed' || view === 'none' || view === 'pending';

  const copy: Record<View, { title: string; body: string }> = {
    checking: { title: 'Confirming your payment', body: 'This takes a few seconds. Please do not close this page.' },
    paid: {
      title: 'Payment received',
      body: orderNumber ? `Thank you. Your order ${orderNumber} is confirmed and we are preparing it.` : 'Thank you. Your order is confirmed and we are preparing it.',
    },
    pending: {
      title: 'Waiting for your payment',
      body: 'We have not received the payment yet. If you have approved it on your phone, it can take a minute to arrive.',
    },
    failed: {
      title: 'The payment did not go through',
      body: 'You have not been charged for this attempt. Your items are held for a short while, so you can try again.',
    },
    problem: {
      title: 'We need to check this payment',
      body: 'The payment could not be matched to your order automatically. Please contact us with your order number and we will sort it out.',
    },
    none: {
      title: 'Complete your payment',
      body: 'Your order is saved and its items are held for a short while. Pay now to confirm it.',
    },
  };

  return (
    <div className="px-4 py-12">
      <div className="mx-auto max-w-md rounded-xl border border-line bg-paper p-6 text-center sm:p-8" role="status" aria-live="polite">
        <h1 className="text-xl font-semibold tracking-tight text-ink">{copy[view].title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-fg">{copy[view].body}</p>

        {view === 'checking' && (
          <div className="mx-auto mt-5 h-1.5 w-40 overflow-hidden rounded-full bg-porcelain" aria-hidden="true">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-petrol" />
          </div>
        )}
        {error && <p className="mt-4 text-sm text-signal" role="alert">{error}</p>}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {hasRetry && (
            <button type="button" onClick={retry} disabled={retrying} className={cn(btn, 'bg-petrol text-white hover:bg-petrol-700')}>
              {retrying ? 'Opening Paystack…' : view === 'none' ? 'Pay now' : 'Try payment again'}
            </button>
          )}
          {view === 'paid' && (
            <Link href="/account/orders" className={cn(btn, 'bg-petrol text-white hover:bg-petrol-700')}>Track order</Link>
          )}
          <Link href="/products" className={cn(btn, 'border border-line bg-paper text-ink hover:bg-porcelain')}>Continue shopping</Link>
        </div>
        {(view === 'failed' || view === 'problem' || view === 'pending') && (
          <p className="mt-4 text-xs text-muted-fg">Need help? <Link href="/contact" className="font-medium text-petrol hover:underline">Contact us</Link>.</p>
        )}
      </div>
    </div>
  );
}

export default function CheckoutCompletePage() {
  return (
    <Suspense fallback={null}>
      <Complete />
    </Suspense>
  );
}
