'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { useCustomerAuth } from '@/lib/auth/customerAuth';
import { useToast } from '@/components/ui/Toast';
import { AccountFrame, accountField, primaryBtn, secondaryBtn } from '../AccountFrame';

const emptyForm = { label: '', address: '', city: '', phone: '' };

export default function AddressesPage() {
  const { customer, isAuthenticated, token } = useCustomerAuth();
  const { toast } = useToast();
  const addresses = useQuery(api.customerAddresses.list, token ? { token } : 'skip');
  const addAddress = useMutation(api.customerAddresses.add);
  const removeAddress = useMutation(api.customerAddresses.remove);
  const setDefaultAddress = useMutation(api.customerAddresses.setDefault);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      await addAddress({ token, ...form });
      setForm(emptyForm);
      setShowForm(false);
      toast('Address added', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to add address', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (addressId: string) => {
    if (!token) return;
    try {
      await removeAddress({ token, addressId: addressId as Id<'customerAddresses'> });
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to remove address', 'error');
    }
  };

  if (customer === undefined) {
    return (
      <AccountFrame title="Addresses">
        <div className="h-40 bg-paper border border-line rounded-xl animate-pulse" />
      </AccountFrame>
    );
  }

  if (!isAuthenticated) {
    return (
      <AccountFrame title="Addresses">
        <div className="bg-paper rounded-xl border border-line p-6 sm:p-8">
          <p className="font-semibold text-ink">Log in to save addresses</p>
          <div className="flex items-center gap-2 mt-5">
            <Link href="/account/login?redirect=/account/addresses" className={secondaryBtn}>Log in</Link>
            <Link href="/account/signup?redirect=/account/addresses" className={primaryBtn}>Sign up</Link>
          </div>
        </div>
      </AccountFrame>
    );
  }

  return (
    <AccountFrame
      title="Addresses"
     
      actions={!showForm ? <button onClick={() => setShowForm(true)} className={primaryBtn}>Add address</button> : undefined}
    >
      {showForm && (
        <form onSubmit={handleAdd} className="bg-paper rounded-xl border border-line p-4 sm:p-6 grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="ad-label" className="block text-sm font-medium text-ink mb-1.5">Label</label>
            <input id="ad-label" required placeholder="Home, Office…" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className={accountField} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="ad-street" className="block text-sm font-medium text-ink mb-1.5">Street address</label>
            <input id="ad-street" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={accountField} />
          </div>
          <div>
            <label htmlFor="ad-city" className="block text-sm font-medium text-ink mb-1.5">City</label>
            <input id="ad-city" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={accountField} />
          </div>
          <div>
            <label htmlFor="ad-phone" className="block text-sm font-medium text-ink mb-1.5">Phone number</label>
            <input id="ad-phone" required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={accountField} />
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" disabled={saving} className={primaryBtn}>{saving ? 'Saving…' : 'Save address'}</button>
            <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }} className={secondaryBtn}>Cancel</button>
          </div>
        </form>
      )}

      {addresses === undefined ? (
        <div className="h-24 bg-paper border border-line rounded-xl animate-pulse" />
      ) : addresses.length === 0 && !showForm ? (
        <div className="bg-paper rounded-xl border border-line p-6 sm:p-8">
          <p className="font-semibold text-ink">No addresses</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr._id} className="bg-paper rounded-xl border border-line p-4 sm:p-6 flex flex-col">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-ink">{addr.label}</p>
                {addr.isDefault && <span className="text-xs border border-line bg-porcelain text-ink px-2 py-0.5 rounded-full font-medium">Default</span>}
              </div>
              <p className="text-sm text-ink mt-2">{addr.address}</p>
              <p className="text-sm text-muted-fg">{addr.city} · {addr.phone}</p>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-line text-sm">
                {!addr.isDefault && (
                  <button onClick={() => setDefaultAddress({ token: token!, addressId: addr._id })} className="text-petrol font-medium hover:underline">
                    Make default
                  </button>
                )}
                <button onClick={() => handleRemove(addr._id)} className="text-muted-fg hover:text-signal transition-colors ml-auto">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AccountFrame>
  );
}
