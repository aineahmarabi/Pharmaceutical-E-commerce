'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { useCustomerAuth } from '@/lib/auth/customerAuth';
import { useToast } from '@/components/ui/Toast';

const ease = [0.16, 1, 0.3, 1] as const;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';
  const { login } = useCustomerAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const result = await login(email, password);
    setSubmitting(false);
    if (result.success) {
      toast('Welcome back!', 'success');
      router.push(redirect);
    } else {
      setError(result.error || 'Failed to log in.');
    }
  };

  return (
    <div className="min-h-screen bg-porcelain py-8 px-4 sm:px-6 lg:px-8 flex items-center">
      <div className="max-w-md mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          <nav className="text-xs text-petrol-300 mb-3 flex gap-2">
            <Link href="/account" className="hover:text-petrol">Account</Link><span>/</span><span className="text-ink/70">Log in</span>
          </nav>
          <h1 className="font-display font-bold text-2xl text-ink tracking-tight flex items-center gap-2">
            <LogIn size={20} className="text-petrol" />Log in
          </h1>
          <p className="text-sm text-ink/60 mt-1">Access your saved profile, addresses, and order history.</p>
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-porcelain border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-petrol transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-petrol hover:bg-petrol-700 text-paper font-semibold py-3 rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </motion.form>

        <p className="text-sm text-ink/60 text-center mt-4">
          Don&apos;t have an account?{' '}
          <Link href={`/account/signup?redirect=${encodeURIComponent(redirect)}`} className="text-petrol font-semibold hover:underline">
            Sign up
          </Link>
        </p>
        <p className="text-xs text-ink/40 text-center mt-2">
          <Link href="/account" className="hover:text-ink/60">Continue browsing without an account →</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
