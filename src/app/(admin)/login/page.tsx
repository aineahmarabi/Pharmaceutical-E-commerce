'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { branding } from '@/lib/config/branding';

const ease = [0.16, 1, 0.3, 1] as const;

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise((r) => setTimeout(r, 800));
    if (email === 'admin@pharmacare.co.ke' && password === 'admin') {
      router.push('/admin');
    } else {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-petrol flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="w-full max-w-sm bg-paper rounded-3xl shadow-2xl p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-signal flex items-center justify-center">
            <span className="font-mono font-bold text-paper text-base">Rx</span>
          </div>
          <div>
            <p className="font-display font-bold text-ink text-lg leading-none">{branding.name}</p>
            <p className="text-xs text-petrol-300">Admin Console</p>
          </div>
        </div>

        <h1 className="font-display font-bold text-xl text-ink mb-1">Sign in</h1>
        <p className="text-sm text-petrol-300 mb-6">Access the management dashboard</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-petrol-300 mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@pharmacare.co.ke"
              required
              className="w-full bg-porcelain border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-petrol transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-petrol-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-porcelain border border-line rounded-xl px-3.5 py-2.5 pr-10 text-sm text-ink focus:outline-none focus:border-petrol transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-petrol-300 hover:text-ink"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-danger font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-petrol hover:bg-petrol-700 disabled:opacity-60 text-paper font-semibold py-3 rounded-xl transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? <span className="w-5 h-5 border-2 border-paper/30 border-t-paper rounded-full animate-spin" /> : 'Sign in'}
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 mt-5 text-xs text-petrol-300">
          <Shield size={11} />
          <span>Staff access only</span>
        </div>
      </motion.div>
    </div>
  );
}
