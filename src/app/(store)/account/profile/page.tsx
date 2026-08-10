'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useToast } from '@/components/ui/Toast';
import { useCustomerAuth } from '@/lib/auth/customerAuth';

const ease = [0.16, 1, 0.3, 1] as const;

export default function ProfilePage() {
  const { toast } = useToast();
  const { customer, isAuthenticated, token } = useCustomerAuth();
  const updateProfile = useMutation(api.customerAuth.updateProfile);

  const [form, setForm] = useState({ name: '', phone: '', email: '', dob: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (customer) {
      setForm({ name: customer.name, phone: customer.phone, email: customer.email, dob: customer.dob });
    }
  }, [customer]);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      const result = await updateProfile({ token, name: form.name, phone: form.phone, dob: form.dob });
      if (result.success) {
        toast('Profile updated', 'success');
      } else {
        toast(result.error ?? 'Failed to update profile', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  if (customer === undefined) {
    return (
      <div className="min-h-screen bg-porcelain py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto animate-pulse">
          <div className="h-6 w-32 bg-line rounded mb-6" />
          <div className="h-64 bg-paper border border-line rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-porcelain py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
            <nav className="text-xs text-petrol-300 mb-3 flex gap-2">
              <Link href="/account" className="hover:text-petrol">Account</Link><span>/</span><span className="text-ink/70">Profile</span>
            </nav>
            <h1 className="font-display font-bold text-2xl text-ink tracking-tight">Edit Profile</h1>
          </motion.div>

          <div className="mt-6 bg-paper rounded-2xl border border-line p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-petrol-50 flex items-center justify-center mx-auto mb-4">
              <UserPlus size={20} className="text-petrol" />
            </div>
            <p className="font-semibold text-sm text-ink">A profile is optional</p>
            <p className="text-sm text-ink/50 mt-1 max-w-sm mx-auto">
              Sign in or create a free account to save your name, phone, and date of birth for faster checkout.
            </p>
            <div className="flex items-center justify-center gap-2 mt-5">
              <Link href="/account/login?redirect=/account/profile" className="text-sm font-semibold text-petrol border border-petrol/30 hover:bg-petrol-50 rounded-xl px-4 py-2 transition-colors">
                Log in
              </Link>
              <Link href="/account/signup?redirect=/account/profile" className="text-sm font-semibold bg-petrol hover:bg-petrol-700 text-paper rounded-xl px-4 py-2 transition-colors">
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
      <div className="max-w-xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          <nav className="text-xs text-petrol-300 mb-3 flex gap-2">
            <Link href="/account" className="hover:text-petrol">Account</Link><span>/</span><span className="text-ink/70">Profile</span>
          </nav>
          <h1 className="font-display font-bold text-2xl text-ink tracking-tight">Edit Profile</h1>
        </motion.div>

        <form onSubmit={handleSave} className="mt-6 bg-paper rounded-2xl border border-line p-6 space-y-4">
          {[
            { key: 'name', label: 'Full name', type: 'text' },
            { key: 'phone', label: 'Phone number', type: 'tel' },
            { key: 'email', label: 'Email address', type: 'email', disabled: true },
            { key: 'dob', label: 'Date of birth', type: 'date' },
          ].map(({ key, label, type, disabled }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-petrol-300 mb-1.5">{label}</label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={update(key as keyof typeof form)}
                disabled={disabled}
                className="w-full bg-porcelain border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-petrol transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-petrol hover:bg-petrol-700 text-paper font-semibold py-3 rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
