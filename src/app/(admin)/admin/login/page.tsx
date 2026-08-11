"use client";

import { useState, useRef, KeyboardEvent } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useRouter } from 'next/navigation';
import { Lock, AlertCircle, Delete } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBranding } from '@/hooks/useBranding';

export default function AdminLogin() {
  const [mode, setMode] = useState<'owner' | 'staff'>('owner');
  const length = mode === 'owner' ? 5 : 4;
  const [digits, setDigits] = useState(['', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const login = useMutation(api.adminAuth.login);
  const loginWithPin = useMutation(api.staff.loginWithPin);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const branding = useBranding();

  const switchMode = (next: 'owner' | 'staff') => {
    setMode(next);
    setError('');
    setDigits(['', '', '', '', '']);
    setTimeout(() => inputRefs.current[0]?.focus(), 0);
  };

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    // Take the last character typed if they type fast
    const digit = value.slice(-1);
    
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    // Auto-advance
    if (digit !== '' && index < length - 1) {
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
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const appendDigit = (d: string) => {
    const emptyIndex = digits.slice(0, length).findIndex((v) => v === '');
    const index = emptyIndex === -1 ? length - 1 : emptyIndex;
    const newDigits = [...digits];
    newDigits[index] = d;
    setDigits(newDigits);
    if (index < length - 1) inputRefs.current[index + 1]?.focus();
    else inputRefs.current[index]?.focus();
  };

  const backspaceDigit = () => {
    const filled = digits.slice(0, length);
    let lastIndex = -1;
    for (let i = filled.length - 1; i >= 0; i--) {
      if (filled[i] !== '') { lastIndex = i; break; }
    }
    if (lastIndex === -1) return;
    const newDigits = [...digits];
    newDigits[lastIndex] = '';
    setDigits(newDigits);
    inputRefs.current[lastIndex]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pastedData) {
      const newDigits = [...digits];
      for (let i = 0; i < pastedData.length; i++) {
        newDigits[i] = pastedData[i];
      }
      setDigits(newDigits);

      // Focus the next empty box or the last box
      const nextIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.slice(0, length).join('');

    if (code.length < length) {
      setError(`Please enter all ${length} digits`);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = mode === 'owner' ? await login({ passcode: code }) : await loginWithPin({ pin: code });
      if (result.success && result.token) {
        localStorage.setItem('adminToken', result.token);
        // Force a hard refresh to bypass layout caching
        window.location.href = '/admin';
      } else {
        setError(result.error || 'Invalid code');
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
          {mode === 'owner' ? 'Enter your 5-digit secure passcode' : 'Enter your 4-digit staff PIN'}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-paper py-10 px-6 shadow-xl sm:rounded-3xl sm:px-10 border border-line">
          <div className="flex justify-center gap-1.5 mb-8 bg-porcelain border border-line rounded-full p-1">
            <button
              type="button"
              onClick={() => switchMode('owner')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${mode === 'owner' ? 'bg-petrol text-paper shadow-sm' : 'text-petrol-300 hover:text-ink'}`}
            >
              Owner
            </button>
            <button
              type="button"
              onClick={() => switchMode('staff')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${mode === 'staff' ? 'bg-petrol text-paper shadow-sm' : 'text-petrol-300 hover:text-ink'}`}
            >
              Staff PIN
            </button>
          </div>
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div>
              <div className="flex justify-center gap-3" onPaste={handlePaste}>
                {digits.slice(0, length).map((digit, index) => (
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

            <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => appendDigit(d)}
                  className="h-14 rounded-xl bg-porcelain border border-line text-xl font-semibold font-mono text-ink hover:bg-petrol-50 hover:border-petrol/40 active:scale-[0.96] transition-all"
                >
                  {d}
                </button>
              ))}
              <div />
              <button
                type="button"
                onClick={() => appendDigit('0')}
                className="h-14 rounded-xl bg-porcelain border border-line text-xl font-semibold font-mono text-ink hover:bg-petrol-50 hover:border-petrol/40 active:scale-[0.96] transition-all"
              >
                0
              </button>
              <button
                type="button"
                onClick={backspaceDigit}
                aria-label="Delete digit"
                className="h-14 rounded-xl bg-porcelain border border-line flex items-center justify-center text-petrol-300 hover:bg-petrol-50 hover:border-petrol/40 active:scale-[0.96] transition-all"
              >
                <Delete size={18} />
              </button>
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
                disabled={isLoading || digits.slice(0, length).some(d => d === '')}
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
