'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { useCustomerAuth } from '@/lib/auth/customerAuth';
import { useToast } from '@/components/ui/Toast';

const ease = [0.16, 1, 0.3, 1] as const;

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';
  const { signup } = useCustomerAuth();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const result = await signup(name, email, password);
    setSubmitting(false);
    if (result.success) {
      toast('Account created!', 'success');
      router.push(redirect);
    } else {
      setError(result.error || 'Failed to create account.');
    }
  };

  return (
    <div className="min-h-screen bg-porcelain py-8 px-4 sm:px-6 lg:px-8 flex items-center">
      <div className="max-w-md mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          <nav className="text-xs text-petrol-300 mb-3 flex gap-2">
            <Link href="/account" className="hover:text-petrol">Account</Link><span>/</span><span className="text-ink/70">Sign up</span>
          </nav>
          <h1 className="font-display font-bold text-2xl text-ink tracking-tight flex items-center gap-2">
            <UserPlus size={20} className="text-petrol" />Create an account
          </h1>
          <p className="text-sm text-ink/60 mt-1">Optional — save your details for faster checkout and order history.</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease }}
          onSubmit={handleSubmit}
          className="mt-6 bg-paper rounded-2xl border border-line p-6 space-y-4"
        >
          {error && (
            <p className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-xl px-3.5 py-2.5">{error}</p>
          )}
          <div>
            <label className="block text-xs font-medium text-petrol-300 mb-1.5">Full name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-porcelain border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-petrol transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-petrol-300 mb-1.5">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-porcelain border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-petrol transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-petrol-300 mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-porcelain border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-petrol transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-petrol-300 mb-1.5">Confirm password</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-porcelain border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-petrol transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-petrol hover:bg-petrol-700 text-paper font-semibold py-3 rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </motion.form>

        <p className="text-sm text-ink/60 text-center mt-4">
          Already have an account?{' '}
          <Link href={`/account/login?redirect=${encodeURIComponent(redirect)}`} className="text-petrol font-semibold hover:underline">
            Log in
          </Link>
        </p>
        <p className="text-xs text-ink/40 text-center mt-2">
          <Link href="/account" className="hover:text-ink/60">Continue browsing without an account →</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
    </Suspense>
  );
}
