'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { Search, Package, MapPin } from 'lucide-react';
import { api } from '../../../../../convex/_generated/api';

const ease = [0.16, 1, 0.3, 1] as const;

const STATUS_LABELS: Record<string, string> = {
  placed: 'Order placed',
  confirmed: 'Confirmed',
  packed: 'Packed',
  delivering: 'Out for delivery',
  completed: 'Delivered',
  cancelled: 'Cancelled',
};

export default function OrdersPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState<{ orderNumber: string; contact: string } | null>(null);

  const result = useQuery(
    api.orders.trackOrder,
    submitted ? { orderNumber: submitted.orderNumber, contact: submitted.contact } : 'skip'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !contact.trim()) return;
    setSubmitted({ orderNumber, contact });
  };

  return (
    <div className="min-h-screen bg-porcelain py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          <nav className="text-xs text-petrol-300 mb-3 flex gap-2">
            <Link href="/account" className="hover:text-petrol">Account</Link><span>/</span><span className="text-ink/70">Track order</span>
          </nav>
          <h1 className="font-display font-bold text-2xl text-ink tracking-tight">Track your order</h1>
          <p className="text-sm text-ink/60 mt-1">Enter your order number and the phone number or email you used at checkout.</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="mt-6 bg-paper border border-line rounded-2xl p-5 space-y-4 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Order number</label>
            <input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. #PHR1042"
              className="w-full px-4 py-2.5 bg-white border border-line rounded-xl focus:outline-none focus:border-petrol text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Phone number or email</label>
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Used at checkout"
              className="w-full px-4 py-2.5 bg-white border border-line rounded-xl focus:outline-none focus:border-petrol text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-petrol text-paper font-semibold py-2.5 rounded-xl hover:bg-petrol/90 transition-colors"
          >
            <Search size={16} /> Track order
          </button>
        </form>

        {submitted && (
          <div className="mt-6">
            {result === undefined ? (
              <p className="text-sm text-ink/50 text-center py-8">Looking up your order...</p>
            ) : !result.found ? (
              <div className="bg-danger/5 border border-danger/20 rounded-2xl p-5 text-center">
                <p className="text-sm text-danger font-medium">{result.error}</p>
              </div>
            ) : (
              <div className="bg-paper border border-line rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display font-bold text-lg text-ink">{result.order.orderNumber}</p>
                    <p className="text-xs text-ink/50 mt-0.5">
                      Placed {new Date(result.order._creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="bg-petrol/10 text-petrol text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide">
                    {STATUS_LABELS[result.order.status] ?? result.order.status}
                  </span>
                </div>

                <div className="border-t border-line pt-4 space-y-2">
                  {result.order.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-ink">{item.name} × {item.qty}</span>
                      <span className="text-ink/70">KES {(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-semibold border-t border-line pt-2 mt-2">
                    <span>Total</span>
                    <span>KES {result.order.total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-line pt-4 flex items-start gap-2">
                  <MapPin size={14} className="text-petrol-300 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-ink/70">{result.order.deliveryAddress}</p>
                </div>

                {result.timeline && result.timeline.length > 0 && (
                  <div className="border-t border-line pt-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-petrol-300">Timeline</p>
                    {result.timeline.map((event: any) => (
                      <div key={event._id} className="flex gap-2 text-sm">
                        <Package size={13} className="text-petrol-300 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-ink">{event.action.replace(/_/g, ' ').toLowerCase()}</p>
                          <p className="text-xs text-ink/50">{new Date(event.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
