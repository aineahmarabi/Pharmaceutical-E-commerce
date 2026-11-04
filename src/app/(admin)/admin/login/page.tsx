"use client";

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useBranding } from '@/hooks/useBranding';
import { usePinEntry } from '@/hooks/usePinEntry';
import { PinKeypad } from '@/components/admin/PinKeypad';

export default function AdminLogin() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useMutation(api.adminAuth.login);
  const branding = useBranding();
  const pin = usePinEntry(5);

  const handleSubmit = async () => {
    if (!pin.isComplete) {
      setError('Please enter all 5 digits');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = await login({ passcode: pin.code });
      if (result.success && result.token) {
        localStorage.setItem('adminToken', result.token);
        window.location.href = '/admin';
      } else {
        setError(result.error || 'Invalid passcode');
        pin.reset();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-p-bg flex flex-col items-center justify-center px-4 py-4 sm:px-6 overflow-hidden font-p-sans">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center text-center mb-5">
          {branding.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={branding.logo} alt={branding.name} className="h-12 w-auto max-w-[16rem] object-contain" />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-p-primary text-white text-lg font-bold flex items-center justify-center overflow-hidden">
              {(branding.name || 'P').charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-p-text">Admin sign in</h1>
          <p className="mt-1 text-sm text-p-text-subdued">Enter your 5-digit passcode for {branding.name}.</p>
        </div>

        <div className="bg-p-bg-surface rounded-xl border border-p-border-subdued shadow-p-card p-6">
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <PinKeypad pin={pin} onEnter={handleSubmit} />

            <AnimatePresence>
              {error && (
                <motion.div
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-lg bg-p-critical-subdued border border-p-border-subdued border-l-4 border-l-p-critical overflow-hidden"
                >
                  <p className="px-4 py-3 text-sm font-medium text-[#991B1B]">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !pin.isComplete}
              className="flex w-full justify-center items-center h-11 rounded-lg bg-p-primary text-sm font-semibold text-white hover:bg-p-primary-hover active:bg-p-primary-active active:scale-[0.98] transition-[background-color,transform] duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p-focus focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin motion-reduce:animate-none" aria-label="Signing in" />
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
