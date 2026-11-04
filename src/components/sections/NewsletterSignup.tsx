'use client';

import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useToast } from '@/components/ui/Toast';

/** Restrained newsletter field for the footer. */
export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const subscribe = useMutation(api.newsletter.subscribe);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    try {
      await subscribe({ email: email.trim() });
      toast("You're subscribed. We'll send you new products and offers.", 'success');
      setEmail('');
    } catch (err) {
      const m = err instanceof Error ? err.message : '';
      const hit = m.match(/Uncaught Error: ([^\n]+)/);
      toast(hit ? hit[1].trim() : 'Failed to subscribe. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-ink">Offers by email</h3>
      <p className="mt-2 text-sm text-muted-fg">New products and offers. No spam.</p>
      <form onSubmit={handleSubmit} className="mt-3 flex w-full max-w-sm items-center gap-1 rounded-full border border-line bg-porcelain p-1 focus-within:border-petrol focus-within:ring-2 focus-within:ring-petrol/40">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="min-w-0 flex-1 bg-transparent px-3 text-sm text-ink placeholder:text-muted-fg focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-petrol px-4 py-2 text-sm font-medium text-white transition-transform duration-100 hover:bg-petrol-700 active:scale-[0.97] disabled:opacity-60"
        >
          {submitting ? 'Sending' : 'Subscribe'}
        </button>
      </form>
    </div>
  );
}
