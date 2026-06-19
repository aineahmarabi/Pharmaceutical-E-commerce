'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/Toast';

const ease = [0.16, 1, 0.3, 1] as const;

export default function ProfilePage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: 'Jane Mwangi', phone: '0712 345 678', email: 'jane@example.com', dob: '' });
  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Profile updated', 'success');
  };

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
            { key: 'email', label: 'Email address', type: 'email' },
            { key: 'dob', label: 'Date of birth', type: 'date' },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-petrol-300 mb-1.5">{label}</label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={update(key as keyof typeof form)}
                className="w-full bg-porcelain border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-petrol transition-colors"
              />
            </div>
          ))}
          <button type="submit" className="w-full bg-petrol hover:bg-petrol-700 text-paper font-semibold py-3 rounded-xl transition-all hover:-translate-y-0.5">
            Save changes
          </button>
        </form>
      </div>
    </div>
  );
}
