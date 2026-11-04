'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCustomerAuth } from '@/lib/auth/customerAuth';
import { useToast } from '@/components/ui/Toast';
import { accountField, primaryBtn } from '../AccountFrame';

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

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

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
    <div className="min-h-screen bg-porcelain px-4 py-10 sm:py-16">
      <div className="max-w-md mx-auto w-full">
        <form onSubmit={handleSubmit} className="bg-paper rounded-xl border border-line p-6 sm:p-8 space-y-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Create an account</h1>
          </div>
          {error && <p role="alert" className="text-sm text-signal border border-signal rounded-lg px-3.5 py-2.5">{error}</p>}
          <div>
            <label htmlFor="su-name" className="block text-sm font-medium text-ink mb-1.5">Full name</label>
            <input id="su-name" type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={accountField} />
          </div>
          <div>
            <label htmlFor="su-email" className="block text-sm font-medium text-ink mb-1.5">Email address</label>
            <input id="su-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={accountField} />
          </div>
          <div>
            <label htmlFor="su-password" className="block text-sm font-medium text-ink mb-1.5">Password</label>
            <input id="su-password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={accountField} />
          </div>
          <div>
            <label htmlFor="su-confirm" className="block text-sm font-medium text-ink mb-1.5">Confirm password</label>
            <input id="su-confirm" type="password" required minLength={8} autoComplete="new-password" aria-invalid={mismatch} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`${accountField} ${mismatch ? 'border-signal' : ''}`} />
            {mismatch && <p className="text-xs text-signal mt-1">Passwords do not match.</p>}
          </div>
          <button type="submit" disabled={submitting} className={`${primaryBtn} w-full py-3`}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-muted-fg text-center mt-4">
          Already have an account?{' '}
          <Link href={`/account/login?redirect=${encodeURIComponent(redirect)}`} className="text-petrol font-semibold hover:underline">Log in</Link>
        </p>
        <p className="text-sm text-center mt-2">
          <Link href="/" className="text-muted-fg hover:text-ink">Continue as guest</Link>
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
