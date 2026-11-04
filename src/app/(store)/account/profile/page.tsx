'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useToast } from '@/components/ui/Toast';
import { useCustomerAuth } from '@/lib/auth/customerAuth';
import { AccountFrame, accountField, primaryBtn, secondaryBtn } from '../AccountFrame';

export default function ProfilePage() {
  const { toast } = useToast();
  const { customer, isAuthenticated, token } = useCustomerAuth();
  const updateProfile = useMutation(api.customerAuth.updateProfile);

  const [form, setForm] = useState({ name: '', phone: '', email: '', dob: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (customer) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync form from customer profile when it loads
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
      <AccountFrame title="Profile">
        <div className="h-64 bg-paper border border-line rounded-xl animate-pulse" />
      </AccountFrame>
    );
  }

  if (!isAuthenticated) {
    return (
      <AccountFrame title="Profile">
        <div className="bg-paper rounded-xl border border-line p-6 sm:p-8">
          <p className="font-semibold text-ink">Log in to edit your profile</p>
          <div className="flex items-center gap-2 mt-5">
            <Link href="/account/login?redirect=/account/profile" className={secondaryBtn}>Log in</Link>
            <Link href="/account/signup?redirect=/account/profile" className={primaryBtn}>Sign up</Link>
          </div>
        </div>
      </AccountFrame>
    );
  }

  return (
    <AccountFrame title="Profile">
      <form onSubmit={handleSave} className="bg-paper rounded-xl border border-line p-4 sm:p-6 grid sm:grid-cols-2 gap-4 max-w-2xl">
        {[
          { key: 'name', label: 'Full name', type: 'text', wide: true },
          { key: 'phone', label: 'Phone number', type: 'tel' },
          { key: 'dob', label: 'Date of birth', type: 'date' },
          { key: 'email', label: 'Email address', type: 'email', disabled: true, wide: true },
        ].map(({ key, label, type, disabled, wide }) => (
          <div key={key} className={wide ? 'sm:col-span-2' : ''}>
            <label htmlFor={`pf-${key}`} className="block text-sm font-medium text-ink mb-1.5">{label}</label>
            <input
              id={`pf-${key}`}
              type={type}
              value={form[key as keyof typeof form]}
              onChange={update(key as keyof typeof form)}
              disabled={disabled}
              className={accountField}
            />
            {disabled && <p className="text-xs text-muted-fg mt-1">Cannot be changed</p>}
          </div>
        ))}
        <div className="sm:col-span-2">
          <button type="submit" disabled={saving} className={primaryBtn}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </AccountFrame>
  );
}
