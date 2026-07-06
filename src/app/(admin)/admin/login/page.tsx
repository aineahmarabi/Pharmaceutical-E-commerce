"use client";

import { useState, useRef, KeyboardEvent } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useRouter } from 'next/navigation';
import { Lock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBranding } from '@/hooks/useBranding';

export default function AdminLogin() {
  const [digits, setDigits] = useState(['', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const login = useMutation(api.adminAuth.login);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const branding = useBranding();

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    // Take the last character typed if they type fast
    const digit = value.slice(-1);
    
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    // Auto-advance
    if (digit !== '' && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index] === '' && index > 0) {
        // Move back
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 4) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 5);
    if (pastedData) {
      const newDigits = [...digits];
      for (let i = 0; i < pastedData.length; i++) {
        newDigits[i] = pastedData[i];
      }
      setDigits(newDigits);
      
      // Focus the next empty box or the last box
      const nextIndex = Math.min(pastedData.length, 4);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const passcode = digits.join('');
    
    if (passcode.length < 5) {
      setError('Please enter all 5 digits');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = await login({ passcode });
      if (result.success && result.token) {
        localStorage.setItem('adminToken', result.token);
        // Force a hard refresh to bypass layout caching
        window.location.href = '/admin';
      } else {
        setError(result.error || 'Invalid passcode');
        // Clear digits on error
        setDigits(['', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-porcelain flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-petrol/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-signal/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="flex justify-center">
          {branding.logo ? (
            <img src={branding.logo} alt={branding.name} className="h-16 object-contain" />
          ) : (
            <div className="h-16 w-16 bg-gradient-to-br from-petrol to-[#0a3830] rounded-2xl flex items-center justify-center shadow-lg shadow-petrol/20">
              <Lock className="h-8 w-8 text-paper" />
            </div>
          )}
        </div>
        <h2 className="mt-8 text-center text-3xl font-display font-bold tracking-tight text-ink">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-petrol-300">
          Enter your 5-digit secure passcode
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-paper py-10 px-6 shadow-xl sm:rounded-3xl sm:px-10 border border-line">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div>
              <div className="flex justify-center gap-3" onPaste={handlePaste}>
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="password"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold font-mono text-petrol bg-porcelain border-2 border-line rounded-xl focus:border-petrol focus:bg-white focus:outline-none focus:ring-4 focus:ring-petrol/10 transition-all shadow-inner"
                    maxLength={2}
                  />
                ))}
              </div>
            </div>

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
                disabled={isLoading || digits.some(d => d === '')}
                className="flex w-full justify-center items-center h-14 rounded-xl bg-petrol text-base font-semibold text-white shadow-md hover:bg-petrol/90 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-petrol/20 transition-all disabled:opacity-50 disabled:hover:shadow-md active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Authenticate'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
