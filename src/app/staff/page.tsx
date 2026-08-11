"use client";

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { UserCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="h-screen bg-porcelain flex flex-col items-center justify-center px-4 py-4 sm:px-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-petrol/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-signal/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex-shrink-0"
      >
        <div className="flex justify-center">
          {branding.logo ? (
            <img src={branding.logo} alt={branding.name} className="h-11 object-contain" />
          ) : (
            <div className="h-11 w-11 bg-gradient-to-br from-petrol to-[#0a3830] rounded-2xl flex items-center justify-center shadow-lg shadow-petrol/20">
              <UserCircle className="h-5 w-5 text-paper" />
            </div>
          )}
        </div>
        <h2 className="mt-3 text-center text-2xl font-display font-bold tracking-tight text-ink">
          Staff Portal
        </h2>
        <p className="mt-1 text-center text-sm text-petrol-300">
          Enter your 4-digit staff PIN
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-5 sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex-shrink-0"
      >
        <div className="bg-paper py-6 px-6 shadow-xl sm:rounded-3xl sm:px-8 border border-line">
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <PinKeypad pin={pin} onEnter={handleSubmit} />

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl bg-red-50 p-4 border border-red-100 overflow-hidden"
                >
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <h3 className="ml-3 text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || !pin.isComplete}
                className="flex w-full justify-center items-center h-12 rounded-xl bg-petrol text-base font-semibold text-white shadow-md hover:bg-petrol/90 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-petrol/20 transition-all disabled:opacity-50 disabled:hover:shadow-md active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
