'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCustomerAuth } from '@/lib/auth/customerAuth';
import { useToast } from '@/components/ui/Toast';
import { accountField, primaryBtn } from '../AccountFrame';

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
    <div className="min-h-screen bg-porcelain px-4 py-10 sm:py-16">
      <div className="max-w-md mx-auto w-full">
        <form onSubmit={handleSubmit} className="bg-paper rounded-xl border border-line p-6 sm:p-8 space-y-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Log in</h1>
          </div>
          {error && <p role="alert" className="text-sm text-signal border border-signal rounded-lg px-3.5 py-2.5">{error}</p>}
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-ink mb-1.5">Email address</label>
            <input id="login-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={accountField} />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-ink mb-1.5">Password</label>
            <input id="login-password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={accountField} />
          </div>
          <button type="submit" disabled={submitting} className={`${primaryBtn} w-full py-3`}>
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="text-sm text-muted-fg text-center mt-4">
          Don&apos;t have an account?{' '}
          <Link href={`/account/signup?redirect=${encodeURIComponent(redirect)}`} className="text-petrol font-semibold hover:underline">Sign up</Link>
        </p>
        <p className="text-sm text-center mt-2">
          <Link href="/" className="text-muted-fg hover:text-ink">Continue as guest</Link>
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
