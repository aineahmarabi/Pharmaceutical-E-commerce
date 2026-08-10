'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Trash2, UserPlus } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useCustomerAuth } from '@/lib/auth/customerAuth';
import { useToast } from '@/components/ui/Toast';

const ease = [0.16, 1, 0.3, 1] as const;

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
    } catch (err: any) {
      toast(err?.message ?? 'Failed to add address', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (addressId: string) => {
    if (!token) return;
    try {
      await removeAddress({ token, addressId: addressId as any });
    } catch (err: any) {
      toast(err?.message ?? 'Failed to remove address', 'error');
    }
  };

  if (customer === undefined) {
    return (
      <div className="min-h-screen bg-porcelain py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto animate-pulse">
          <div className="h-6 w-32 bg-line rounded mb-6" />
          <div className="h-40 bg-paper border border-line rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-porcelain py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
            <nav className="text-xs text-petrol-300 mb-3 flex gap-2">
              <Link href="/account" className="hover:text-petrol">Account</Link><span>/</span><span className="text-ink/70">Addresses</span>
            </nav>
            <h1 className="font-display font-bold text-2xl text-ink tracking-tight">Delivery Addresses</h1>
          </motion.div>

          <div className="mt-6 bg-paper rounded-2xl border border-line p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-petrol-50 flex items-center justify-center mx-auto mb-4">
              <UserPlus size={20} className="text-petrol" />
            </div>
            <p className="font-semibold text-sm text-ink">Saved addresses are optional</p>
            <p className="text-sm text-ink/50 mt-1 max-w-sm mx-auto">
              You can enter your delivery address at checkout every time — or sign in to save it for faster future orders.
            </p>
            <div className="flex items-center justify-center gap-2 mt-5">
              <Link href="/account/login?redirect=/account/addresses" className="text-sm font-semibold text-petrol border border-petrol/30 hover:bg-petrol-50 rounded-xl px-4 py-2 transition-colors">
                Log in
              </Link>
              <Link href="/account/signup?redirect=/account/addresses" className="text-sm font-semibold bg-petrol hover:bg-petrol-700 text-paper rounded-xl px-4 py-2 transition-colors">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-porcelain py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          <nav className="text-xs text-petrol-300 mb-3 flex gap-2">
            <Link href="/account" className="hover:text-petrol">Account</Link><span>/</span><span className="text-ink/70">Addresses</span>
          </nav>
          <h1 className="font-display font-bold text-2xl text-ink tracking-tight">Delivery Addresses</h1>
        </motion.div>

        <div className="mt-6 space-y-3">
          {addresses === undefined ? (
            <div className="h-20 bg-paper border border-line rounded-2xl animate-pulse" />
          ) : (
            addresses.map((addr) => (
              <div key={addr._id} className="bg-paper rounded-2xl border border-line p-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-petrol-50 flex items-center justify-center flex-shrink-0">
                    <MapPin size={16} className="text-petrol" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-ink">{addr.label}</p>
                      {addr.isDefault ? (
                        <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full font-medium">Default</span>
                      ) : (
                        <button
                          onClick={() => setDefaultAddress({ token: token!, addressId: addr._id })}
                          className="text-xs text-petrol hover:underline"
                        >
                          Set as default
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-petrol-300 mt-0.5">{addr.address}</p>
                    <p className="text-xs text-petrol-300">{addr.city} · {addr.phone}</p>
                  </div>
                </div>
                <button onClick={() => handleRemove(addr._id)} className="text-danger/40 hover:text-danger transition-colors flex-shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}

          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.form
                key="form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAdd}
                className="bg-paper rounded-2xl border border-line p-5 space-y-3 overflow-hidden"
              >
                <input required placeholder="Label (e.g. Home, Office)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="w-full bg-porcelain border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-petrol transition-colors" />
                <input required placeholder="Street address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full bg-porcelain border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-petrol transition-colors" />
                <div className="grid grid-cols-2 gap-3">
                  <input required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full bg-porcelain border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-petrol transition-colors" />
                  <input required placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-porcelain border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-petrol transition-colors" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={saving} className="flex-1 bg-petrol hover:bg-petrol-700 text-paper font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60">
                    {saving ? 'Saving…' : 'Save address'}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }} className="px-4 text-sm font-semibold text-ink/50 hover:text-ink transition-colors">
                    Cancel
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.button
                key="cta"
                onClick={() => setShowForm(true)}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-line text-sm text-petrol hover:border-petrol hover:bg-petrol-50 transition-colors"
              >
                <Plus size={16} />Add new address
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
