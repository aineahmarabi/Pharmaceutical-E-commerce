"use client";

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useBranding } from '@/hooks/useBranding';
import { usePinEntry } from '@/hooks/usePinEntry';
import { PinKeypad } from '@/components/admin/PinKeypad';
import { ROLE_LANDING_PATH, type StaffRole } from '@/lib/permissions';

export default function StaffLogin() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const loginWithPin = useMutation(api.staff.loginWithPin);
  const branding = useBranding();
  const pin = usePinEntry(4);

  const handleSubmit = async () => {
    if (!pin.isComplete) {
      setError('Please enter all 4 digits');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = await loginWithPin({ pin: pin.code });
      if (result.success && result.token) {
        localStorage.setItem('adminToken', result.token);
        window.location.href = ROLE_LANDING_PATH[result.role as StaffRole] ?? '/admin';
      } else {
        setError(result.error || 'Incorrect PIN');
        pin.reset();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-porcelain flex flex-col items-center justify-center px-4 py-6 sm:px-6">
      <div className="w-full max-w-sm text-center">
        {branding.logo ? (
          <img src={branding.logo} alt={branding.name} className="h-10 object-contain mx-auto" />
        ) : (
          <p className="text-lg font-semibold tracking-tight text-ink">{branding.name}</p>
        )}
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">Staff sign in</h1>
        <p className="mt-1 text-sm text-muted-fg">Enter your 4-digit PIN</p>
      </div>

      <div className="mt-6 w-full max-w-sm bg-paper rounded-xl border border-line p-6">
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <PinKeypad pin={pin} onEnter={handleSubmit} />

          {error && (
            <div role="alert" className="rounded-lg border border-signal/30 px-3 py-2 text-sm text-signal">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !pin.isComplete}
            className="flex w-full justify-center items-center h-11 rounded-lg bg-petrol text-sm font-semibold text-white hover:bg-petrol-700 focus:outline-none focus:ring-2 focus:ring-petrol/40 transition-colors disabled:opacity-50 active:scale-[0.98]"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
