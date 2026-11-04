'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { useCustomerAuth } from '@/lib/auth/customerAuth';
import { useToast } from '@/components/ui/Toast';
import { BuyAgainButton } from '@/components/account/BuyAgainButton';

const DAY_CHOICES = [14, 30, 60, 90];

function fmt(ms: number) {
  return new Date(ms).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
}

/** The signed-in customer's active reminders (empty for guests). */
export function useRefillReminders() {
  const { token, isAuthenticated } = useCustomerAuth();
  const reminders = useQuery(api.refillReminders.listMine, isAuthenticated && token ? { token } : 'skip');
  const [now] = useState(() => Date.now());
  const list = reminders ?? [];
  return {
    all: list,
    due: list.filter((r) => r.remindAt <= now),
    upcoming: list.filter((r) => r.remindAt > now),
    loading: isAuthenticated && reminders === undefined,
  };
}

/** Small dot for the account icon when something is due. Renders nothing otherwise. */
export function AccountReminderDot() {
  const { due } = useRefillReminders();
  if (due.length === 0) return null;
  return (
    <span
      aria-label={`${due.length} refill ${due.length === 1 ? 'reminder' : 'reminders'}`}
      className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-signal ring-2 ring-paper"
    />
  );
}

/** "Remind me to reorder" control for one order. */
export function RefillReminderButton({ orderId }: { orderId: string }) {
  const { token } = useCustomerAuth();
  const { toast } = useToast();
  const { all } = useRefillReminders();
  const create = useMutation(api.refillReminders.create);
  const dismiss = useMutation(api.refillReminders.dismiss);
  const [days, setDays] = useState(30);
  const [busy, setBusy] = useState(false);

  if (!token) return null;
  const existing = all.find((r) => r.orderId === orderId);

  if (existing) {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-muted-fg">
        Reminder set for <span className="font-medium text-ink">{fmt(existing.remindAt)}</span>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await dismiss({ token, id: existing._id });
              toast('Reminder removed', 'info');
            } finally {
              setBusy(false);
            }
          }}
          className="font-medium text-petrol hover:underline underline-offset-2 disabled:opacity-60"
        >
          Remove
        </button>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <label htmlFor={`remind-${orderId}`} className="sr-only">Remind me to reorder in</label>
      <select
        id={`remind-${orderId}`}
        value={days}
        onChange={(e) => setDays(Number(e.target.value))}
        className="h-9 rounded-lg border border-line bg-paper px-2 text-sm text-ink focus:border-petrol focus:outline-none focus:ring-2 focus:ring-petrol/40"
      >
        {DAY_CHOICES.map((d) => (
          <option key={d} value={d}>Remind me in {d} days</option>
        ))}
      </select>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const res = await create({ token, orderId: orderId as Id<'orders'>, days });
            if (res.success) toast(`We will remind you on the site in ${days} days`, 'success');
            else toast(res.error ?? 'Could not set the reminder', 'error');
          } catch {
            toast('Could not set the reminder', 'error');
          } finally {
            setBusy(false);
          }
        }}
        className="h-9 rounded-lg border border-line bg-paper px-3 text-sm font-semibold text-ink transition-colors hover:bg-porcelain active:scale-[0.97] duration-100 disabled:opacity-60"
      >
        Set reminder
      </button>
    </span>
  );
}

/** Cards for reminders that have come due: reorder in one tap or dismiss. Renders nothing when none are due. */
export function RefillDueCard() {
  const { token } = useCustomerAuth();
  const { due } = useRefillReminders();
  const complete = useMutation(api.refillReminders.complete);
  const dismiss = useMutation(api.refillReminders.dismiss);
  if (!token || due.length === 0) return null;

  return (
    <section aria-label="Refill reminders" className="space-y-3">
      {due.map((r) => (
        <div key={r._id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-petrol/40 bg-petrol-50 p-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">Time to refill?</p>
            <p className="mt-0.5 truncate text-sm text-muted-fg">
              From order {r.orderNumber}: {r.items.map((i) => i.name).join(', ')}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <BuyAgainButton items={r.items} onAdded={() => complete({ token, id: r._id })} />
            <button
              type="button"
              onClick={() => dismiss({ token, id: r._id })}
              className="text-sm font-medium text-muted-fg hover:text-ink"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}

/** Upcoming (not yet due) reminders, for the account page. */
export function UpcomingReminders() {
  const { token } = useCustomerAuth();
  const { upcoming } = useRefillReminders();
  const dismiss = useMutation(api.refillReminders.dismiss);
  if (!token || upcoming.length === 0) return null;
  return (
    <section className="rounded-xl border border-line bg-paper" aria-labelledby="upcoming-reminders">
      <h2 id="upcoming-reminders" className="border-b border-line px-4 py-3 text-base font-semibold tracking-tight text-ink sm:px-6">
        Refill reminders
      </h2>
      <ul className="divide-y divide-line">
        {upcoming.map((r) => (
          <li key={r._id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm sm:px-6">
            <span className="min-w-0">
              <span className="block font-medium text-ink">{fmt(r.remindAt)} · order {r.orderNumber}</span>
              <span className="block truncate text-xs text-muted-fg">{r.items.map((i) => i.name).join(', ')}</span>
            </span>
            <button type="button" onClick={() => dismiss({ token, id: r._id })} className="shrink-0 font-medium text-petrol hover:underline underline-offset-2">
              Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
